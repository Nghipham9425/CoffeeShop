import { categoryData } from "../../data/Category/Category.data.js";
import type { CategoryModel } from "../../models/Category/Category.model.js";
import { slugify } from "../../utils/slugify.js";
import type {
  CategoryQueryInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../validators/Category/Category.validator.js";

type CategoryRecord = Awaited<ReturnType<typeof categoryData.findMany>>[number];

function mapCategory(category: CategoryRecord): CategoryModel {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
    productCount: category._count.products,
  };
}

async function buildUniqueSlug(name: string, preferredSlug?: string, currentCategoryId?: number) {
  const baseSlug = slugify(preferredSlug ?? name);
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existingCategory = await categoryData.findBySlug(slug);

    if (!existingCategory || existingCategory.id === currentCategoryId) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

export const categoryService = {
  async getCategories(query: CategoryQueryInput) {
    const categories = await categoryData.findMany(query);
    return categories.map(mapCategory);
  },

  async getCategoryById(id: number) {
    const category = await categoryData.findById(id);
    return category ? mapCategory(category) : null;
  },

  async createCategory(input: CreateCategoryInput) {
    const slug = await buildUniqueSlug(input.name, input.slug);
    const category = await categoryData.create({ ...input, slug });
    return mapCategory(category);
  },

  async updateCategory(id: number, input: UpdateCategoryInput) {
    const existingCategory = await categoryData.findById(id);

    if (!existingCategory) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    const slug =
      input.name || input.slug
        ? await buildUniqueSlug(input.name ?? existingCategory.name, input.slug, id)
        : undefined;

    const category = await categoryData.update(id, { ...input, slug });
    return mapCategory(category);
  },

  async deleteCategory(id: number) {
    const existingCategory = await categoryData.findById(id);

    if (!existingCategory) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    return mapCategory(await categoryData.softDelete(id));
  },
};
