const express = require('express');
const path = require('path');
const compression = require('compression');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8080;

// 관리자 인증 설정
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'coupang2024!'; // 실제 환경에서는 환경변수로 관리하세요

// 데이터베이스 설정
const DB_FILE = path.join(__dirname, 'coupangblog.db');
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err.message);
    } else {
        console.log('SQLite 데이터베이스에 연결되었습니다.');
        
        // 테트리스 랭킹 테이블
        db.run(`CREATE TABLE IF NOT EXISTS rankings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT NOT NULL,
            score INTEGER NOT NULL,
            level INTEGER NOT NULL,
            lines INTEGER NOT NULL,
            date TEXT NOT NULL,
            ip TEXT
        )`, (err) => {
            if (err) {
                console.error('테이블 생성 실패:', err.message);
            } else {
                // 테이블이 비어있을 경우 기본 데이터 추가
                db.get('SELECT COUNT(*) as count FROM rankings', (err, row) => {
                    if (row && row.count === 0) {
                        console.log('기본 랭킹 데이터를 추가합니다.');
                        const stmt = db.prepare('INSERT INTO rankings (nickname, score, level, lines, date) VALUES (?, ?, ?, ?, ?)');
                        const defaultRankings = [
                            { nickname: 'Player1', score: 50000, level: 5, lines: 25 },
                            { nickname: 'Player2', score: 40000, level: 4, lines: 20 },
                            { nickname: 'Player3', score: 30000, level: 3, lines: 15 },
                            { nickname: 'Player4', score: 20000, level: 2, lines: 10 },
                            { nickname: 'Player5', score: 10000, level: 1, lines: 5 }
                        ];
                        defaultRankings.forEach(r => {
                            stmt.run(r.nickname, r.score, r.level, r.lines, new Date().toISOString());
                        });
                        stmt.finalize();
                    }
                });
            }
        });
        
        // 리뷰 테이블 생성
        db.run(`CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            excerpt TEXT,
            content TEXT NOT NULL,
            meta_description TEXT,
            keywords TEXT,
            products TEXT,
            views INTEGER DEFAULT 0,
            featured INTEGER DEFAULT 0,
            published INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('리뷰 테이블 생성 실패:', err.message);
            } else {
                console.log('리뷰 테이블이 준비되었습니다.');
            }
        });
        
        // SEO 설정 테이블
        db.run(`CREATE TABLE IF NOT EXISTS seo_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT
        )`, (err) => {
            if (err) {
                console.error('SEO 설정 테이블 생성 실패:', err.message);
            } else {
                console.log('SEO 설정 테이블이 준비되었습니다.');
            }
        });
    }
});

// JSON 바디 파싱을 위한 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS 헤더 설정
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Gzip 압축 활성화
app.use(compression());

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, '/')));

// 관리자 인증 미들웨어
const adminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ success: false, error: '인증이 필요합니다.' });
    }
    
    const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ success: false, error: '인증 실패' });
    }
};

// ==================== 기본 라우트 ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 리뷰 페이지 라우트
app.get('/review/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'review.html'));
});

// ==================== 리뷰 API ====================

// 리뷰 목록 조회 (공개)
app.get('/api/reviews', (req, res) => {
    const { category, featured, limit = 20, offset = 0 } = req.query;
    
    let query = 'SELECT id, slug, title, category, excerpt, views, featured, created_at FROM reviews WHERE published = 1';
    const params = [];
    
    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    
    if (featured === 'true') {
        query += ' AND featured = 1';
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('리뷰 목록 조회 오류:', err.message);
            return res.status(500).json({ success: false, error: '리뷰를 불러올 수 없습니다.' });
        }
        
        res.json({ success: true, data: rows });
    });
});

// 특정 리뷰 조회 (공개)
app.get('/api/reviews/:slug', (req, res) => {
    const { slug } = req.params;
    
    // 조회수 증가
    db.run('UPDATE reviews SET views = views + 1 WHERE slug = ?', [slug], (err) => {
        if (err) {
            console.error('조회수 업데이트 오류:', err.message);
        }
    });
    
    db.get('SELECT * FROM reviews WHERE slug = ? AND published = 1', [slug], (err, row) => {
        if (err) {
            console.error('리뷰 조회 오류:', err.message);
            return res.status(500).json({ success: false, error: '리뷰를 불러올 수 없습니다.' });
        }
        
        if (!row) {
            return res.status(404).json({ success: false, error: '리뷰를 찾을 수 없습니다.' });
        }
        
        // products 필드를 JSON으로 파싱
        if (row.products) {
            try {
                row.products = JSON.parse(row.products);
            } catch (e) {
                row.products = [];
            }
        }
        
        res.json({ success: true, data: row });
    });
});

// 리뷰 생성 (관리자 전용)
app.post('/api/reviews', adminAuth, async (req, res) => {
    const {
        slug,
        title,
        category,
        excerpt,
        content,
        meta_description,
        keywords,
        products,
        featured,
        published
    } = req.body;
    
    if (!slug || !title || !category || !content) {
        return res.status(400).json({ success: false, error: '필수 항목을 입력해주세요.' });
    }
    
    const now = new Date().toISOString();
    const productsJson = JSON.stringify(products || []);
    
    const query = `
        INSERT INTO reviews (
            slug, title, category, excerpt, content, 
            meta_description, keywords, products, featured, published,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
        slug,
        title,
        category,
        excerpt || '',
        content,
        meta_description || '',
        keywords || '',
        productsJson,
        featured ? 1 : 0,
        published ? 1 : 0,
        now,
        now
    ], async function(err) {
        if (err) {
            console.error('리뷰 생성 오류:', err.message);
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ success: false, error: '이미 존재하는 URL입니다.' });
            }
            return res.status(500).json({ success: false, error: '리뷰를 생성할 수 없습니다.' });
        }
        
        // HTML 파일 생성
        try {
            await generateReviewHTML(slug, title, category, content, products, meta_description, keywords);
            await updateSitemap();
        } catch (e) {
            console.error('HTML 생성 오류:', e);
        }
        
        res.json({ success: true, data: { id: this.lastID, slug } });
    });
});

// 리뷰 수정 (관리자 전용)
app.put('/api/reviews/:id', adminAuth, async (req, res) => {
    const { id } = req.params;
    const {
        slug,
        title,
        category,
        excerpt,
        content,
        meta_description,
        keywords,
        products,
        featured,
        published
    } = req.body;
    
    const now = new Date().toISOString();
    const productsJson = JSON.stringify(products || []);
    
    const query = `
        UPDATE reviews SET
            slug = ?, title = ?, category = ?, excerpt = ?, content = ?,
            meta_description = ?, keywords = ?, products = ?, featured = ?, published = ?,
            updated_at = ?
        WHERE id = ?
    `;
    
    db.run(query, [
        slug,
        title,
        category,
        excerpt || '',
        content,
        meta_description || '',
        keywords || '',
        productsJson,
        featured ? 1 : 0,
        published ? 1 : 0,
        now,
        id
    ], async function(err) {
        if (err) {
            console.error('리뷰 수정 오류:', err.message);
            return res.status(500).json({ success: false, error: '리뷰를 수정할 수 없습니다.' });
        }
        
        // HTML 파일 업데이트
        try {
            await generateReviewHTML(slug, title, category, content, products, meta_description, keywords);
            await updateSitemap();
        } catch (e) {
            console.error('HTML 업데이트 오류:', e);
        }
        
        res.json({ success: true, data: { id, slug } });
    });
});

// 리뷰 삭제 (관리자 전용)
app.delete('/api/reviews/:id', adminAuth, async (req, res) => {
    const { id } = req.params;
    
    // 먼저 slug를 가져옴
    db.get('SELECT slug FROM reviews WHERE id = ?', [id], async (err, row) => {
        if (err) {
            console.error('리뷰 조회 오류:', err.message);
            return res.status(500).json({ success: false, error: '리뷰를 삭제할 수 없습니다.' });
        }
        
        if (!row) {
            return res.status(404).json({ success: false, error: '리뷰를 찾을 수 없습니다.' });
        }
        
        db.run('DELETE FROM reviews WHERE id = ?', [id], async (err) => {
            if (err) {
                console.error('리뷰 삭제 오류:', err.message);
                return res.status(500).json({ success: false, error: '리뷰를 삭제할 수 없습니다.' });
            }
            
            // HTML 파일 삭제
            try {
                await fs.unlink(path.join(__dirname, 'reviews', `${row.slug}.html`));
                await updateSitemap();
            } catch (e) {
                console.error('HTML 삭제 오류:', e);
            }
            
            res.json({ success: true });
        });
    });
});

// ==================== SEO API ====================

// SEO 설정 조회
app.get('/api/seo-settings', (req, res) => {
    db.all('SELECT key, value FROM seo_settings', [], (err, rows) => {
        if (err) {
            console.error('SEO 설정 조회 오류:', err.message);
            return res.status(500).json({ success: false, error: 'SEO 설정을 불러올 수 없습니다.' });
        }
        
        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        
        res.json({ success: true, data: settings });
    });
});

// SEO 설정 업데이트 (관리자 전용)
app.post('/api/seo-settings', adminAuth, (req, res) => {
    const settings = req.body;
    
    const stmt = db.prepare('INSERT OR REPLACE INTO seo_settings (key, value) VALUES (?, ?)');
    
    Object.entries(settings).forEach(([key, value]) => {
        stmt.run(key, value);
    });
    
    stmt.finalize((err) => {
        if (err) {
            console.error('SEO 설정 업데이트 오류:', err.message);
            return res.status(500).json({ success: false, error: 'SEO 설정을 저장할 수 없습니다.' });
        }
        
        res.json({ success: true });
    });
});

// ==================== 테트리스 랭킹 API (기존 코드) ====================

// 랭킹 목록 조회
app.get('/api/rankings', (req, res) => {
    const query = `
        SELECT * FROM rankings 
        ORDER BY score DESC, level DESC, lines DESC 
        LIMIT 50
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('랭킹 조회 오류:', err.message);
            return res.status(500).json({ success: false, error: '랭킹 데이터를 불러올 수 없습니다.' });
        }
        
        db.get('SELECT COUNT(*) as total FROM rankings', (err, countRow) => {
            if (err) {
                console.error('랭킹 총계 조회 오류:', err.message);
                return res.status(500).json({ success: false, error: '랭킹 데이터를 불러올 수 없습니다.' });
            }
            
            res.json({
                success: true,
                data: rows,
                total: countRow.total
            });
        });
    });
});

// 새 점수 추가
app.post('/api/rankings', (req, res) => {
    const { nickname, score, level, lines } = req.body;
    
    if (!nickname || typeof score !== 'number' || typeof level !== 'number' || typeof lines !== 'number' || score < 0 || level < 1 || lines < 0 || nickname.length > 20) {
        return res.status(400).json({ success: false, error: '올바른 데이터를 입력해주세요.' });
    }
    
    const newEntry = {
        nickname: nickname.trim(),
        score: parseInt(score),
        level: parseInt(level),
        lines: parseInt(lines),
        date: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress
    };
    
    const insertQuery = 'INSERT INTO rankings (nickname, score, level, lines, date, ip) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.run(insertQuery, [newEntry.nickname, newEntry.score, newEntry.level, newEntry.lines, newEntry.date, newEntry.ip], function(err) {
        if (err) {
            console.error('점수 추가 오류:', err.message);
            return res.status(500).json({ success: false, error: '점수를 등록할 수 없습니다.' });
        }
        
        const newId = this.lastID;
        
        // 순위 계산
        const rankQuery = `
            SELECT COUNT(*) + 1 as rank 
            FROM rankings 
            WHERE score > ? OR 
                  (score = ? AND level > ?) OR 
                  (score = ? AND level = ? AND lines > ?)
        `;
        
        db.get(rankQuery, [newEntry.score, newEntry.score, newEntry.level, newEntry.score, newEntry.level, newEntry.lines], (err, row) => {
            if (err) {
                console.error('순위 계산 오류:', err.message);
                return res.status(500).json({ success: false, error: '순위를 계산할 수 없습니다.' });
            }
            
            console.log(`새 점수 추가: ${newEntry.nickname} - ${newEntry.score}점 (${row.rank}위)`);
            
            // 상위 1000개만 유지 (서버 용량 관리)
            db.run(`
                DELETE FROM rankings 
                WHERE id NOT IN (
                    SELECT id FROM rankings 
                    ORDER BY score DESC, level DESC, lines DESC 
                    LIMIT 1000
                )
            `);

            res.json({
                success: true,
                data: {
                    rank: row.rank,
                    entry: { id: newId, ...newEntry },
                }
            });
        });
    });
});

// ==================== 헬퍼 함수 ====================

// 리뷰 HTML 생성
async function generateReviewHTML(slug, title, category, content, products, metaDescription, keywords) {
    const reviewDir = path.join(__dirname, 'reviews');
    
    // reviews 디렉토리가 없으면 생성
    try {
        await fs.mkdir(reviewDir, { recursive: true });
    } catch (e) {
        // 디렉토리가 이미 존재하는 경우 무시
    }
    
    // 템플릿 읽기
    const template = await fs.readFile(path.join(__dirname, 'review-template.html'), 'utf-8');
    
    // 템플릿 치환
    let html = template;
    html = html.replace(/\{\{title\}\}/g, title);
    html = html.replace(/\{\{category\}\}/g, category);
    html = html.replace(/\{\{content\}\}/g, content);
    html = html.replace(/\{\{metaDescription\}\}/g, metaDescription || title);
    html = html.replace(/\{\{keywords\}\}/g, keywords || '');
    html = html.replace(/\{\{date\}\}/g, new Date().toLocaleDateString('ko-KR'));
    
    // 상품 정보 처리
    if (products && products.length > 0) {
        const productHtml = products.map(product => `
            <div class="product-widget">
                <h3>${product.name}</h3>
                <p>가격: ${product.price}</p>
                ${product.rating ? `<p>평점: ${product.rating}/5.0</p>` : ''}
                <a href="${product.url}" class="buy-button" target="_blank" rel="nofollow">
                    쿠팡에서 최저가 확인하기
                </a>
            </div>
        `).join('');
        
        html = html.replace('{{products}}', productHtml);
    } else {
        html = html.replace('{{products}}', '');
    }
    
    // HTML 파일 저장
    await fs.writeFile(path.join(reviewDir, `${slug}.html`), html, 'utf-8');
}

// 사이트맵 업데이트
async function updateSitemap() {
    const baseUrl = 'https://wongram.shop';
    
    db.all('SELECT slug, updated_at FROM reviews WHERE published = 1 ORDER BY updated_at DESC', [], async (err, rows) => {
        if (err) {
            console.error('사이트맵 생성 오류:', err.message);
            return;
        }
        
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/tetris-game</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        
        rows.forEach(row => {
            sitemap += `
    <url>
        <loc>${baseUrl}/review/${row.slug}</loc>
        <lastmod>${new Date(row.updated_at).toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>`;
        });
        
        sitemap += '\n</urlset>';
        
        try {
            await fs.writeFile(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf-8');
            console.log('사이트맵이 업데이트되었습니다.');
        } catch (e) {
            console.error('사이트맵 저장 오류:', e);
        }
    });
}

// ==================== 404 및 에러 핸들러 ====================
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('서버 오류가 발생했습니다.');
});

// ==================== 서버 시작 ====================
const server = app.listen(PORT, () => {
    console.log(`쿠팡 블로그 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`브라우저에서 http://localhost:${PORT} 를 방문하세요.`);
    console.log(`관리자 페이지: http://localhost:${PORT}/admin.html`);
    console.log(`테트리스 게임: http://localhost:${PORT}/tetris-game`);
});

// Graceful shutdown
const shutdown = () => {
    console.log('서버를 종료합니다...');
    server.close(() => {
        console.log('HTTP 서버가 닫혔습니다.');
        db.close((err) => {
            if (err) {
                console.error('데이터베이스 연결 종료 실패:', err.message);
            } else {
                console.log('데이터베이스 연결이 닫혔습니다.');
            }
            process.exit(0);
        });
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('처리되지 않은 프로미스 거부:', reason);
});