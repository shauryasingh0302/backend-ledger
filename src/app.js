const express= require("express")
const cookieParser = require("cookie-parser")

const app = express()

app.use(express.json())
app.use(cookieParser())

// Routes Required
const authRouter = require("./routes/auth.routes.js")
const accountRouter = require("./routes/account.routes.js")
const transactionRouter = require("./routes/transaction.routes.js")

app.use("/",(req,res)=>{
    res.send("Ledger API is running!!");
})

// Use Routes
app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRouter)

module.exports = app