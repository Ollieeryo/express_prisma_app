const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const db2 = process.env.SECOND_DATABASE_URL;
const prisma2 = new PrismaClient({ datasources: { db: { url: db2 }} })
const db3 = process.env.THIRD_DATABASE_URL;
const prisma3 = new PrismaClient({ datasources: { db: { url: db3 }} })

module.exports = {
  getSite: async (req, res) => {
    try {
      const { limit } = req.query; // Assuming you pass the limit as a query parameter
      const queryOptions = {};
      if (limit) {
        queryOptions.take = parseInt(limit, 10)
      }
      const site = await prisma.site.findMany(queryOptions);

      await prisma.$disconnect();
      res.json(site);
    } catch (error) {
      console.error('Error fetching Site: server', error);
      res.status(500).json({ error: 'Error fetching Site' });
    }
  },
  getPowerBySiteId: async (req, res) => {
    try {
      const siteId = parseInt(req.params.id);
      const name = req.query.name;
  
      if (!name) {
        return res.status(400).json({ error: 'Name parameter is required' });
      }

      const power = await prisma2.power.findMany({
        where: {
          siteId: siteId,
          name: name
        },
        distinct: ['name'], //不要重複的 name 資料
      })
      
      if (!power || power.length === 0) {
        return res.status(404).json({ error: 'Power not found' });
      }
      res.json(power);
    } catch (error) {
      console.error('Error fetching power:', error);
      res.status(500).json({ error: 'Error fetching power' });
    }
  },
  getNameList: async (req, res) => {
    try {
      const siteId = parseInt(req.params.id);
      const nameList = await prisma.nameList.findMany({
        where: {
          siteId: siteId,
          NOT: {
            nameDesc: 'test'
          }
        },
      })

      await prisma.$disconnect();
      res.json(nameList)
    } catch (error) {
      console.error('Error fetching NameList:', error);
      res.status(500).json({ error: 'Error fetching NameList' });
    }
  },
  getOneWeekAgoPowerDataById: async (req, res) => {
    try {
      const siteId = parseInt(req.params.id);
      const name = req.query.name;
      // console.log('Received request with siteId:', siteId, 'and name:', name);

      if (siteId <= 0) {
        return res.status(400).json({ error: 'siteId parameter is required' });
      }

      if (!name) {
        return res.status(400).json({ error: 'Name parameter is required' });
      }

      // 計算一周前的時間
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 20);

      const targetDate = new Date('2023-08-22T00:00:00.000Z');
      
      // 查詢一周內指定powerId的資料
      const powerData = await prisma2.power.findMany({
        where: {
          siteId: siteId,
          name: name,
          ts: {
            gte: oneWeekAgo,
          },
        },
        orderBy: {
          ts: 'asc',
        },
      });

      if (!powerData || powerData.length === 0) {
        return res.status(404).json({ error: 'Last 8 days data not found' });
      }

      await prisma2.$disconnect();
      res.json(powerData);
    } catch (error) {
      console.error(`Error fetching power data:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  getLastWeekPower: async (req, res) => {
    try {
      const siteId = parseInt(req.params.id);
      const name = req.query.name;

      if (siteId <= 0) {
        return res.status(400).json({ error: 'siteId parameter is required' });
      }

      if (!name) {
        return res.status(400).json({ error: 'Name parameter is required' });
      }

      // 計算一周前的時間
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 20);
      
      // 查詢一周內指定powerId的資料
      const powerData = await prisma3.power_09.findMany({
        where: {
          siteId: siteId,
          name: name,
          ts: {
            gte: oneWeekAgo,
          },
        },
        orderBy: {
          ts: 'asc',
        },
      });

      if (!powerData || powerData.length === 0) {
        return res.status(404).json({ error: 'Last 8 days data not found' });
      }

      await prisma3.$disconnect(); 
      res.json(powerData);
    } catch (error) {
      console.error(`Error fetching power data:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  getPowerByDate: async (req, res) => {
    try {
      const { siteId, name, date } = req.query;
      // 把前端傳遞過來的 date 日期格式調整成 2023-03-01，後端就不需要再進行格式處理
      // 但是要提取月份，可用 substring，另外 tableName 也可以順著處理
      const month = date.substring(5, 7); //擷取月份
      const tableName = `power_${month}`;

      // 使用者傳遞日期格式處理
      // const datePickerValue = new Date(date);
      // const month = datePickerValue.getMonth() + 1;
      // const formattedDate = datePickerValue.toISOString().substring(0, 10);

      // 動態生成 table 名稱，例如 "power_01", "power_02", ..., 而且要 string 才能用 padStart
      // const tableName = `power_${month.toString().padStart(2, '0')}`;

      const id = parseInt(siteId);

      // 使用 Prisma 的 queryRaw 方法執行 SQL 查詢
      // 原本 queryRaw 是不支援動態 table 的搜索，但是使用 Prisma.raw 可以成功進行搜索
      const power = await prisma3.$queryRaw`SELECT * FROM ${Prisma.raw(tableName)} WHERE DATE(ts) = ${date} AND siteId = ${id} AND name = ${name}`;
      
      
      res.json(power);
    } catch (error) {
      console.error('Error fetching power by date:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      await prisma3.$disconnect();
    }
  },
  getPowerDataInRange: async (req, res) => {
    try {
      const { siteId, name, startDate, endDate } = req.query;
      const id = parseInt(siteId);
      const startNewDate = new Date(startDate);
      const endNewDate = new Date(endDate);

      const tableNames = [];
      // 先遍歷使用者選擇的日期範圍，並且加入到空陣列中 (ex. power_03, power_04 .....etc)，來確定要搜索那些月份的 table
      // while (startNewDate <= endNewDate) {
      //   const month = (startNewDate.getMonth() + 1).toString().padStart(2, '0');
      //   tableNames.push(`power_${month}`);
      //   startNewDate.setMonth(startNewDate.getMonth() + 1); // 進入下一個月
      // }

      // Use a for loop to iterate through the date range
      for (let date = startNewDate; date <= endNewDate; date.setMonth(date.getMonth() + 1)) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 擷取月份
        tableNames.push(`power_${month}`); // 放進陣列
      }
      
      // 用 Prisma.raw 把陣列中的月份用 map + join 變成字串，並且都加上 UNION ALL 來合併 table
      const powerRange = await prisma3.$queryRaw`
        SELECT * FROM (
          ${Prisma.raw(tableNames.map(tableName => `SELECT * FROM ${tableName}`).join(' UNION ALL '))}
        ) AS combined
        WHERE DATE(ts) BETWEEN ${startDate} AND ${endDate}
          AND siteId = ${id}
          AND name = ${name};
      `;

      res.json(powerRange);
    } catch (error) {
      console.error('Error fetching power by date range:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      await prisma3.$disconnect();
    }
  }
}