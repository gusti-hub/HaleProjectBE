const express = require("express");
const router = express.Router();
const auth = require("../utils/jwtUtils");

const Time = require("../models/Time&Expenses");
const Expenses = require("../models/Expenses.js");
module.exports = router;

// Get user's time data
router.get("/times/:userId", async (req, res) => {
	try {
		const { userId } = req.params;

		// Find time data for the specific user
		let timeData = await Time.findOne({ userid: userId });

		if (!timeData) {
			// If no time data exists, create a new entry
			timeData = new Time({
				userid: userId,
				time: [], // Initialize with an empty array for time entries
			});
			await timeData.save(); // Save the new entry
			return res
				.status(201)
				.json({ message: "New time data created", timeData: [] });
		}

		console.log("Time Data:", timeData);

		// Return only the filtered data for the projectCode
		res.status(200).json({ timeData });
	} catch (error) {
		console.error("Error fetching time data:", error);
		res.status(500).json({ message: "Server error" });
	}
});
router.get("/fetch-times/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Find time data by document id
        const timeData = await Time.findById(id);

        if (!timeData) {
            return res.status(404).json({ message: "No time data found for the provided ID" });
        }

        console.log("Time Data:", timeData);

        // Return the time data
        res.status(200).json({ timeData });
    } catch (error) {
        console.error("Error fetching time data:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Update or create user's time data
router.put('/times/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeEntries } = req.body;

        // Validate request
        if (!timeEntries || !Array.isArray(timeEntries) || timeEntries.length === 0) {
            return res.status(400).json({ message: 'No time entries provided' });
        }

        // Create a new time entry document with multiple days
        const newTimeEntry = new Time({
            userid: userId,
            time: timeEntries.map(entry => ({
                date: new Date(entry.date),
                projects: entry.projects.map(project => ({
                    projectCode: project.code,
                    hours: project.hours,
                }))
            })),
        });

        // Save the new time entry to the database
        await newTimeEntry.save();

        res.status(200).json({ message: 'New time entry created successfully', newTimeEntry });
    } catch (error) {
        console.error('Error saving time entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
});





router.post("/add-expense", async (req, res) => {
	const { prj, frmDate, toDate, type, amount, totalAmount, comment, imageUrl } =
		req.body;

	if (!prj || !frmDate || !toDate || !type || !amount || !totalAmount) {
		return res
			.status(400)
			.json({ message: "Please provide all the mandatory details." });
	}

	try {
		const newExpense = new Expenses({
			prj,
			frmDate,
			toDate,
			type,
			amount,
			totalAmount,
			comment,
			imageUrl,
		});

		await newExpense.save();

		res.status(201).json({ message: "Expense added successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
});

router.get("/expenses", auth, async (req, res) => {
	try {
		const expenses = await Expenses.find();
		res.status(200).json(expenses);
	} catch (error) {
		console.error("Server error:", error);
		res.status(500).json({ message: "Server error", error });
	}
});

module.exports = router;
