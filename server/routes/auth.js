const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 회원가입 페이지
router.get('/register', (req, res) => {
  res.render('auth/register', { 
    title: '회원가입',
    error: null 
  });
});

// 회원가입 처리
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/register', {
        title: '회원가입',
        error: '이미 사용 중인 이메일입니다.'
      });
    }
    
    // 사용자 생성
    const user = new User({
      email,
      password,
      username
    });
    
    await user.save();
    
    // 자동 로그인
    req.session.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    };
    
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.render('auth/register', {
      title: '회원가입',
      error: '회원가입 중 오류가 발생했습니다.'
    });
  }
});

// 로그인 페이지
router.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: '로그인',
    error: null 
  });
});

// 로그인 처리
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', {
        title: '로그인',
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: '로그인',
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date();
    await user.save();
    
    // 세션 설정
    req.session.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    };
    
    // Admin이면 관리자 페이지로, 아니면 홈으로
    if (user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    res.render('auth/login', {
      title: '로그인',
      error: '로그인 중 오류가 발생했습니다.'
    });
  }
});

// 로그아웃
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

// Admin 계정 초기화 (최초 1회만)
router.get('/init-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(403).json({ error: '이미 관리자가 존재합니다.' });
    }
    
    const admin = new User({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      username: 'Admin',
      role: 'admin'
    });
    
    await admin.save();
    res.json({ message: '관리자 계정이 생성되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '관리자 계정 생성 실패' });
  }
});

module.exports = router;
