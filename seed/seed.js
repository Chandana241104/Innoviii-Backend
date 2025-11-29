require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const Test = require('../models/Test');

(async ()=>{
  try{
    await connectDB();
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@innoviii.test';
    const pass = process.env.SEED_ADMIN_PASS || 'admin123';
    let admin = await Admin.findOne({ email });
    if(!admin){
      const hash = await bcrypt.hash(pass, 10);
      admin = new Admin({ name: 'Innoviii Admin', email, passwordHash: hash });
      await admin.save();
      console.log('Seeded admin:', email, pass);
    } else {
      console.log('Admin already exists');
    }

    // Member test created from uploaded Members Questions PDF
    const existingMember = await Test.findOne({ title: /Member Entrance Test - Uploaded/ });
    if(!existingMember){
      const sample = new Test({
        title: 'Member Entrance Test - Uploaded',
        role: 'member',
        description: 'Member behavioral & problem-solving questions uploaded by the admin.',
        durationMinutes: 60, // Changed to 60 minutes
        published: true,
        questions: [
  {
    "id": "q1",
    "type": "short",
    "text": "Imagine you are given a task with no clear instructions. What would you do first?",
    "marks": 4
  },
  {
    "id": "q2",
    "type": "short",
    "text": "When you get stuck, do you usually ask for help, search online, or try until you solve it?",
    "marks": 4
  },
  {
    "id": "q3",
    "type": "short",
    "text": "Do you see mistakes as failures or as opportunities to learn? Why?",
    "marks": 4
  },
  {
    "id": "q4",
    "type": "short",
    "text": "How do you stay positive when something doesn\u2019t go your way?",
    "marks": 4
  },
  {
    "id": "q5",
    "type": "short",
    "text": "If someone criticizes your work, how would you handle it?",
    "marks": 4
  },
  {
    "id": "q6",
    "type": "short",
    "text": "What was the last 'why/how' question you asked yourself?",
    "marks": 4
  },
  {
    "id": "q7",
    "type": "short",
    "text": "If you had the chance, which skill (outside your studies) would you love to explore?",
    "marks": 4
  },
  {
    "id": "q8",
    "type": "short",
    "text": "Do you prefer working alone first or directly learning with others?",
    "marks": 4
  },
  {
    "id": "q9",
    "type": "short",
    "text": "What kind of learning makes you more excited\u2014structured (step-by-step) or exploring freely?",
    "marks": 4
  },
  {
    "id": "q10",
    "type": "short",
    "text": "What do you enjoy most about working in a team?",
    "marks": 4
  },
  {
    "id": "q11",
    "type": "short",
    "text": "If a teammate is struggling, how would you support them?",
    "marks": 4
  },
  {
    "id": "q12",
    "type": "short",
    "text": "Do you prefer small groups, large groups, or one-on-one collaboration? Why?",
    "marks": 4
  }
]
      });
      await sample.save();
      console.log('Seeded member test (uploaded questions) with 60 minutes duration');
    } else {
      console.log('Member uploaded test exists');
    }

    // Mentor test created from uploaded Technical questions PDF
    const existingMentor = await Test.findOne({ title: /Mentor Technical Test - Uploaded/ });
    if(!existingMentor){
      const sample2 = new Test({
        title: 'Mentor Technical Test - Uploaded',
        role: 'mentor',
        description: 'Technical & mentorship questions for mentors uploaded by the admin.',
        durationMinutes: 60, // Changed to 60 minutes
        published: true,
        questions: [
  {
    "id": "q1",
    "type": "short",
    "text": "What is the difference between a primitive data type and a complex or reference data type?",
    "marks": 4
  },
  {
    "id": "q2",
    "type": "short",
    "text": "Provide an example of a primitive data type and a complex data type in a language you are familiar with.",
    "marks": 4
  },
  {
    "id": "q3",
    "type": "short",
    "text": "Explain the purpose of if-else statements, for loops, and while loops.",
    "marks": 4
  },
  {
    "id": "q4",
    "type": "short",
    "text": "When would you choose a for loop over a while loop, and vice-versa?",
    "marks": 4
  },
  {
    "id": "q5",
    "type": "short",
    "text": "What is a function, and why are they important in programming?",
    "marks": 4
  },
  {
    "id": "q6",
    "type": "short",
    "text": "Explain the difference between passing arguments by value and passing them by reference.",
    "marks": 4
  },
  {
    "id": "q7",
    "type": "short",
    "text": "Define what an algorithm is.",
    "marks": 4
  },
  {
    "id": "q8",
    "type": "short",
    "text": "What are the two key factors used to analyse an algorithm's efficiency?",
    "marks": 4
  },
  {
    "id": "q9",
    "type": "short",
    "text": "List and briefly explain the four pillars of OOP.",
    "marks": 4
  },
  {
    "id": "q10",
    "type": "short",
    "text": "Provide a real-world example for Polymorphism.",
    "marks": 4
  },
  {
    "id": "q11",
    "type": "short",
    "text": "What is a data structure?",
    "marks": 4
  },
  {
    "id": "q12",
    "type": "short",
    "text": "Explain the difference between an array and a linked list.",
    "marks": 4
  },
  {
    "id": "q13",
    "type": "short",
    "text": "When would you choose to use a hash map (or dictionary) over an array?",
    "marks": 4
  },
  {
    "id": "q14",
    "type": "short",
    "text": "What is recursion?",
    "marks": 4
  },
  {
    "id": "q15",
    "type": "short",
    "text": "Write a simple recursive function to calculate the factorial of a number.",
    "marks": 4
  },
  {
    "id": "q16",
    "type": "short",
    "text": "What are the potential risks of using recursion?",
    "marks": 4
  },
  {
    "id": "q17",
    "type": "short",
    "text": "How do you handle errors and exceptions in your code?",
    "marks": 4
  },
  {
    "id": "q18",
    "type": "short",
    "text": "Why is robust error handling critical for a program's reliability?",
    "marks": 4
  },
  {
    "id": "q19",
    "type": "short",
    "text": "How do you approach mentoring a new team member with less experience than you?",
    "marks": 4
  },
  {
    "id": "q20",
    "type": "short",
    "text": "Describe a situation where you had to explain a complex technical concept to a non-technical audience.",
    "marks": 4
  },
  {
    "id": "q21",
    "type": "short",
    "text": "Describe a time you took on a leadership role for a project. What challenges did you face, and how did you overcome them?",
    "marks": 4
  },
  {
    "id": "q22",
    "type": "short",
    "text": "How do you motivate a team to meet a tight deadline?",
    "marks": 4
  },
  {
    "id": "q23",
    "type": "short",
    "text": "Tell me about a time you had to make a difficult decision that impacted your team.",
    "marks": 4
  },
  {
    "id": "q24",
    "type": "short",
    "text": "Describe a challenging project you worked on. What was your role, and what was the outcome?",
    "marks": 4
  },
  {
    "id": "q25",
    "type": "short",
    "text": "Tell me about a time you failed at something. What did you learn from the experience?",
    "marks": 4
  },
  {
    "id": "q26",
    "type": "short",
    "text": "Give an example of a time you received constructive criticism. How did you react, and what changes did you make?",
    "marks": 4
  }
]
      });
      await sample2.save();
      console.log('Seeded mentor test (uploaded questions) with 60 minutes duration');
    } else {
      console.log('Mentor uploaded test exists');
    }

    process.exit(0);
  }catch(err){
    console.error(err);
    process.exit(1);
  }
})();