const express = require("express")
const authControlller = require("../controllers/auth.controller.js")
const createAccountController = require("../controllers/account.controller.js")

const router = express.Router()

/* POST /api/auth/register */
router.post("/register", authControlller.userRegisterController)

/* POST /api/auth/register */
router.post("/login",authControlller.userLoginController)

/**
 * -POST /api/auth/logout
 */

router.post("/logout", authControlller.userLogoutController)

module.exports = router