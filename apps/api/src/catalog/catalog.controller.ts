import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { CatalogService } from "./catalog.service.js";

@Controller("api/catalog")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list() {
    return this.catalog.list();
  }

  @Get("activity/recent")
  activity() {
    return this.catalog.activity();
  }

  @Get(":slug")
  async bySlug(@Param("slug") slug: string) {
    try {
      return await this.catalog.bySlug(slug);
    } catch {
      throw new NotFoundException("API product not found");
    }
  }
}
