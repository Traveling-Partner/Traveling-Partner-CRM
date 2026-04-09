import { subDays, subHours } from "date-fns";
import { BlogPost } from "@/types/domain";
import { adminUsers } from "./users";

const titles = [
  "Scaling Your Driver Fleet Across Regions",
  "How to Design a World-Class Onboarding Funnel",
  "Optimizing Commissions for High-Performing Agents",
  "Reducing Fraud in Ride-Hailing Platforms",
  "Building Trust with Premium Partner Experience"
];

const categories = ["Operations", "Growth", "Product", "Safety", "Partnerships"];
const readTimes = ["4 min read", "5 min read", "6 min read", "7 min read"];

export const blogPosts: BlogPost[] = Array.from({ length: 16 }).map(
  (_, index) => {
    const admin = adminUsers[index % adminUsers.length];
    const createdAt = subDays(new Date(), index + 1);
    const updatedAt = subHours(createdAt, index % 12);
    const published =
      index % 3 === 0 ? subDays(new Date(), index).toISOString() : undefined;

    const title = titles[index % titles.length];
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    return {
      id: `blog-${index + 1}`,
      title,
      slug,
      excerpt:
        "A strategic look at how mobility companies can use the Traveling Partner model to accelerate market expansion while maintaining operational excellence.",
      content:
        "<p>This is rich text placeholder content for the Traveling Partner Portal blog. It demonstrates how articles will be stored and rendered in the admin experience.</p>",
      category: categories[index % categories.length],
      authorName: admin.name,
      readTime: readTimes[index % readTimes.length],
      status: index % 4 === 0 ? "DRAFT" : "PUBLISHED",
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      publishedAt: published,
      views: 120 + index * 17,
      featuredImageUrl:
        "https://images.pexels.com/photos/104836/pexels-photo-104836.jpeg",
      seoTitle: `${title} | Traveling Partner Portal`,
      seoDescription:
        "Learn how to operate a high-performing ride-hailing partner network with actionable playbooks from our operations team.",
      createdByAdminId: admin.id
    };
  }
);

