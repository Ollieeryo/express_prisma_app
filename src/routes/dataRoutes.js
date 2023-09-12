const express = require('express');
const router = express.Router();
// const { authenticateJWT, authenticatedRole } = require('../middleware/auth');
const dataController = require('../controllers/dataController');

router.get('/sites', dataController.getSite);
router.get('/sites/:id', dataController.getPowerBySiteId) //特定 siteId 的所有 power
router.get('/sites/namelist/:id', dataController.getNameList)
router.get('/sites/powerdata/:id', dataController.getOneWeekAgoPowerDataById) //特定 siteId 的特定 power
router.get('/sites/powerdata/lastweek/:id', dataController.getLastWeekPower)
router.get('/sites/date/power', dataController.getPowerByDate) // 特定 siteId 的某個日期的 power 資料
router.get('/sites/date/power/range', dataController.getPowerDataInRange) // 特定日期範圍的 power 資料

module.exports = router;