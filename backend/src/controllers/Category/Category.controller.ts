import type { Request, Response } from "express";
import { categoryService } from "../../services/Category/Category.service.js";
import {
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/Category/Category.validator.js";

export const categoryController = {
  async getCategories(req: Request, res: Response) {
    const query = categoryQuerySchema.parse(req.query);
    const categories = await categoryService.getCategories(query);
    res.json(categories);
  },

  async getCategoryById(req: Request, res: Response) {
    const category = await categoryService.getCategoryById(Number(req.params.id));

    if (!category) {
      res.status(404).json({ message: "Không tìm thấy danh mục" });
      return;
    }

    res.json(category);
  },

  async createCategory(req: Request, res: Response) {
    const payload = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(payload);
    res.status(201).json(category);
  },

  async updateCategory(req: Request, res: Response) {
    const categoryId = Number(req.params.id);
    const payload = updateCategorySchema.parse(req.body);

    try {
      const category = await categoryService.updateCategory(categoryId, payload);
      res.json(category);
    } catch (error) {
      if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy danh mục" });
        return;
      }

      throw error;
    }
  },

  async deleteCategory(req: Request, res: Response) {
    const categoryId = Number(req.params.id);

    try {
      await categoryService.deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy danh mục" });
        return;
      }

      throw error;
    }
  },
};
