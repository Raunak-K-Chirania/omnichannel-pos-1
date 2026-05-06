import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Auth route working");
});

export default router;