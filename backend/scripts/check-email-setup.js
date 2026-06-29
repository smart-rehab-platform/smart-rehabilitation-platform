require("dotenv").config();

const pool = require("../src/database/db");
const {
  sendEmailVerificationEmail,
  buildVerificationLink
} = require("../src/modules/auth/auth.email");

const isSmtpConfigured = () =>
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

async function main() {
  console.log("SMTP configured:", isSmtpConfigured());
  console.log("EMAIL_USER:", process.env.EMAIL_USER || "(missing)");
  console.log(
    "EMAIL_PASSWORD length:",
    (process.env.EMAIL_PASSWORD || "").length
  );

  const users = await pool.query(
    `SELECT email, is_email_verified, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 5`
  );
  console.log("\nRecent users:");
  console.log(JSON.stringify(users.rows, null, 2));

  const targetEmail = process.argv[2] || process.env.EMAIL_USER;
  if (!targetEmail) {
    await pool.end();
    return;
  }

  const link = buildVerificationLink("diagnostic-test-token");
  console.log("\nAttempting verification email to:", targetEmail);

  try {
    const result = await sendEmailVerificationEmail({
      email: targetEmail,
      fullName: "Diagnostic Test",
      verificationLink: link
    });
    console.log("Send result:", result);
  } catch (error) {
    console.error("Send failed:", error.message);
    if (error.response) {
      console.error("SMTP response:", error.response);
    }
  }

  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
