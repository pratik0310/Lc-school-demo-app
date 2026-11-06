const router = require('express').Router();
const c = require('../controllers/lcController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(protect);

router.post('/', upload.array('documents', 6), wrap(c.apply));
router.get('/my', wrap(c.myApplications));
router.get('/', adminOnly, wrap(c.allApplications));
router.get('/:id', wrap(c.getOne));
router.patch('/:id/status', adminOnly, wrap(c.updateStatus));
router.get('/:id/doc/:filename', wrap(c.getDocument));
router.get('/:id/download', wrap(c.downloadLC));

module.exports = router;
