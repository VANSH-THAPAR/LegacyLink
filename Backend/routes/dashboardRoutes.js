const express = require('express');
const router = express.Router();
const Alumni = require("../models/alumni");
const Student = require("../models/student");

// [FIXED] This route is now GET /api/dashboard/fetch-total
router.get('/fetch-total', async (req,res)=>{
    try{
        const countAlumni = await Alumni.countDocuments({});
        const countStudent = await Student.countDocuments({});
        console.log('GET /api/dashboard/fetch-total - HIT!');
        res.status(200).json({totalStudents : countStudent , totalAlumni : countAlumni});
    }catch(err){
        console.error("ERROR fetching totals:", err);
        res.status(500).json({totalStudents : "Unable to fetch total students" , totalAlumni : "Unable to fetch total alumnis"});
    }
});

module.exports = router;
