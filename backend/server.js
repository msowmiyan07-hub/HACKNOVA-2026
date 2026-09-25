const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Schema
const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      unique: true,
      required: true
    },

    teamName: {
      type: String,
      required: true
    },

    collegeName: {
      type: String,
      required: true
    },

    teamSize: {
      type: Number,
      required: true,
      enum: [4, 5]
    },

    leader: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      mobile: {
        type: String,
        required: true
      }
    },

    members: [
      {
        name: {
          type: String,
          required: true
        },
        email: {
          type: String,
          required: true
        }
      }
    ],

    transactionId: {
      type: String,
      required: true
    },

    status: {
      type: String,
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

const Registration = mongoose.model(
  "Registration",
  registrationSchema
);

// Health Check
app.get("/", (req, res) => {
  res.json({
    message: "HACKNOVA 2026 Backend is running!"
  });
});

// Registration API
app.post("/api/register", async (req, res) => {
  try {
    const {
      teamName,
      collegeName,
      teamSize,
      leader,
      members,
      transactionId
    } = req.body;

    // Required field check
    if (
      !teamName ||
      !collegeName ||
      !teamSize ||
      !leader ||
      !leader.name ||
      !leader.email ||
      !leader.mobile ||
      !members ||
      !transactionId
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields."
      });
    }

    // Team size validation
    if (![4, 5].includes(Number(teamSize))) {
      return res.status(400).json({
        success: false,
        message: "Team size must be 4 or 5."
      });
    }

    // Member validation
    const requiredMembers = Number(teamSize) - 1;

    if (members.length !== requiredMembers) {
      return res.status(400).json({
        success: false,
        message: `For a team of ${teamSize}, ${requiredMembers} members are required.`
      });
    }

    // Generate Registration ID
    const registrationId =
      "HKN2026-" +
      Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create registration
    const registration = new Registration({
      registrationId,
      teamName,
      collegeName,
      teamSize: Number(teamSize),
      leader,
      members,
      transactionId,
      status: "Pending"
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully!",
      registrationId: registrationId
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error. Please try again."
    });
  }
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`HACKNOVA Backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
