import batchRoutes from "./batch.routes.js";
import aiRoutes from "./ai.routes.js";
import qrRoutes from "./qr.routes.js";
import complaintRoutes from "./complaint.routes.js";

app.use("/batch", batchRoutes);
app.use("/ai", aiRoutes);
app.use("/qr", qrRoutes);
app.use("/complaint", complaintRoutes);