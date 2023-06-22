const router = require('express').Router();

const { COOKIE_SESSION_NAME } = require('../constants');
const authService = require('../services/authService');
const { isAuth, isGuest } = require('../middleWares/authMiddleware');
const { getErrorMessage } = require('../utils/errorHelpers');

router.get('/login', isGuest, (req, res) => {
    res.render('auth/login');
});

router.post('/login', isGuest, async (req, res) => {
    try{
    const { username, password } = req.body;

    const user = await authService.login(username, password);
    const token = await authService.createToken(user);

    res.cookie(COOKIE_SESSION_NAME, token, { httpOnly: true });
    res.redirect('/');
    } catch(err){
        return res.render('auth/login', { error: getErrorMessage(err) });
    }
    
});


router.get('/register', isGuest, (req, res) => {
    res.render('auth/register');
});

router.post('/register', isGuest, async (req, res) => {
    const { username, password, repeatPassword, address } = req.body;

    if (password !== repeatPassword) {
        return res.render('auth/register', { error: 'Password not match' });
    }

    // Create user
    try {
        const createdUser = await authService.create({ username, password, address });
        const token = await authService.createToken(createdUser);
        res.cookie(COOKIE_SESSION_NAME, token, { httpOnly: true });
        res.redirect('/');

    } catch (error) {
        // Add mongoose error mapper
        return res.render('auth/register', { error: getErrorMessage(error) });
    }
});


router.get('/logout', isAuth, (req, res) => {
    res.clearCookie(COOKIE_SESSION_NAME);
    res.redirect('/');
});



module.exports = router;