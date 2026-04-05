/**
 * Script one-off pour mettre à jour l'image de l'article "Les 10 meilleures poutines".
 * Usage : npx tsx scripts/update-poutine-image.ts
 * Ou :    npx ts-node --project prisma/tsconfig.seed.json scripts/update-poutine-image.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = "10-meilleures-poutines-montreal-guide-definitif";
  const newImageUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/La_Banquise_Poutine.jpg/960px-La_Banquise_Poutine.jpg";
  const newImageCredit = `Par <a rel="nofollow" href="https://www.flickr.com/people/7845551@N05">Yuri Long</a> from Arlington, VA, USA — <a rel="nofollow" href="https://www.flickr.com/photos/yurilong/4917518173/">road_trip-9349.jpg</a>, <a href="https://creativecommons.org/licenses/by/2.0" title="Creative Commons Attribution 2.0">CC BY 2.0</a>, via <a href="https://commons.wikimedia.org/w/index.php?curid=19029778">Wikimedia Commons</a>`;

  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) {
    console.error(`❌ Article introuvable : ${slug}`);
    process.exit(1);
  }

  const updated = await prisma.article.update({
    where: { slug },
    data: { imageUrl: newImageUrl, imageCredit: newImageCredit },
    select: { title: true, slug: true, imageUrl: true, imageCredit: true },
  });

  console.log("✅ Image mise à jour :");
  console.log(`   Titre : ${updated.title}`);
  console.log(`   Slug  : ${updated.slug}`);
  console.log(`   Image : ${updated.imageUrl}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
