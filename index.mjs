import express from "express";
import cors from "cors";
import userRoutes from "./src/routes/api/user-routes.mjs";
import viewsRoutes from "./src/routes/views.mjs";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/", viewsRoutes);
app.use("/api", userRoutes);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
