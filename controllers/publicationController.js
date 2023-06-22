const router = require('express').Router();

const { isAuth } = require('../middleWares/authMiddleware');
const { preloadPublication, isPublicationAuthor } = require('../middleWares/publicationMiddlewares');
const publicationService = require('../services/publicationService');
const { getErrorMessage } = require('../utils/errorHelpers');
const userService = require('../services/userService');


router.get('/', async (req, res) => {
    const publications = await publicationService.getAll().lean();
    res.render('publication/gallery', { publications });
});

router.get('/:publicationId/details', async (req, res) => {
    const publication = await publicationService.getOneDetailed(req.params.publicationId).lean();
    const isAuthor = publication.author._id == req.user?._id;   // req.user?._id ако нямаме _id -> ? ще пита има ли user, ако няма ще е undefined
    const isShared = publication.usersShared.some(x => x._id == req.user._id);

    res.render('publication/details', { ...publication, isAuthor, isShared });
});



router.get('/create', isAuth, (req, res) => {
    res.render('publication/create');
});

router.post('/create', isAuth, async (req, res) => {
    const publicationData = { ...req.body, author: req.user._id };

    try {
        const publication = await publicationService.create(publicationData);
        await userService.addPublication(req.user._id, publication._id);
        res.redirect('/publications');
    } catch (error) {
        res.render('/publication/create', { ...req.body, error: getErrorMessage(error) });
    }
});




router.get('/:publicationId/edit', isAuth, preloadPublication, isPublicationAuthor, async (req, res, next) => {
    res.render('publication/edit', { ...req.publication });
});

router.post('/:publicationId/edit', isAuth, preloadPublication, isPublicationAuthor, async (req, res, next) => {
    try {
        await publicationService.update(req.params.publicationId, req.body)
        res.redirect(`/publications/${req.params.publicationId}/details`);
    } catch (error) {
        res.render('publication/edit', { ...req.body, error: getErrorMessage(error) });
    }
});



router.get('/:publicationId/delete', isAuth, preloadPublication, isPublicationAuthor, async (req, res, next) => {
    await publicationService.delete(req.params.publicationId);
    res.redirect('/publications');
});



router.get('/:publicationId/share', isAuth, async (req, res, next) => {
    const publication = await publicationService.getOne(req.params.publicationId);
    const user = await userService.getOne(req.user._id);

    publication.usersShared.push(req.user._id);
    user.shares.push(publication);

    await publication.save();
    await user.save();
    res.redirect('/');
});



module.exports = router;