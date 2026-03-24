const { supabaseAdmin } = require("../config/supabase");

/**
 * auth middleware
 * Verifies the Supabase JWT from the Authorization header
 * and attaches the decoded user to req.user
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user and role to request
    req.user = {
      ...data.user,
      role:
        data.user.app_metadata?.role ||
        data.user.user_metadata?.role ||
        "citizen",
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = auth;