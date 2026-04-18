import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed...");

  // ── Catégories ─────────────────────────────────────────────────────
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: "montreal-local" },
      update: {},
      create: { name: "Montréal Local", slug: "montreal-local" },
    }),
    db.category.upsert({
      where: { slug: "culture" },
      update: {},
      create: { name: "Culture", slug: "culture" },
    }),
    db.category.upsert({
      where: { slug: "societe" },
      update: {},
      create: { name: "Société", slug: "societe" },
    }),
    db.category.upsert({
      where: { slug: "ailleurs" },
      update: {},
      create: { name: "Ailleurs", slug: "ailleurs" },
    }),
    db.category.upsert({
      where: { slug: "gastronomie" },
      update: {},
      create: { name: "Gastronomie", slug: "gastronomie" },
    }),
    db.category.upsert({
      where: { slug: "style-de-vie" },
      update: {},
      create: { name: "Style de vie", slug: "style-de-vie" },
    }),
  ]);

  const [catLocal, catCulture, catSociete, catAilleurs, catGastro, catStyle] = categories;
  console.log(`✓ ${categories.length} catégories créées`);

  // ── Utilisateurs ───────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin1234", 12);
  const userPassword = await bcrypt.hash("user1234", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@montrealuncovered.com" },
    update: {},
    create: {
      name: "Équipe MTL Uncovered",
      email: "admin@montrealuncovered.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const author2 = await db.user.upsert({
    where: { email: "sofia@montrealuncovered.com" },
    update: {},
    create: {
      name: "Sofia Tremblay",
      email: "sofia@montrealuncovered.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const author3 = await db.user.upsert({
    where: { email: "marc@montrealuncovered.com" },
    update: {},
    create: {
      name: "Marc-Antoine Beaulieu",
      email: "marc@montrealuncovered.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const user = await db.user.upsert({
    where: { email: "lecteur@example.com" },
    update: {},
    create: {
      name: "Marie-Lune Desrochers",
      email: "lecteur@example.com",
      password: userPassword,
      role: "USER",
    },
  });

  console.log(`✓ 4 utilisateurs créés`);

  // ── Articles ───────────────────────────────────────────────────────
  const articles = [
    // ─── MONTRÉAL LOCAL ──────────────────────────────────────────────
    {
      title: "Le Plateau-Mont-Royal en 2026 : entre gentrification et résistance culturelle",
      slug: "plateau-mont-royal-2026-gentrification-resistance",
      excerpt: "Le quartier emblématique de Montréal continue de se transformer. Nous avons rencontré ceux qui y habitent, ceux qui y travaillent, et ceux qui se battent pour préserver son âme.",
      imageUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1200&q=80",
      content: `Je me souviens de la première fois que j'ai marché sur l'avenue Mont-Royal, il y a une dizaine d'années. Il y avait un dépanneur un peu crasseux au coin de Saint-Denis, une friperie tenue par une dame qui s'appelait Ginette, et un café où le filtre coûtait un dollar cinquante. Aujourd'hui, le dépanneur est devenu un bar à jus pressé à froid, la friperie est une boutique de vêtements scandinaves, et le café vend des lattés à six dollars avec du lait d'avoine.

Le Plateau-Mont-Royal est en train de changer, et tout le monde le sait. Ce qui est moins évident, c'est à quel point ce changement est violent pour ceux qui y habitent depuis toujours.

## Les chiffres derrière le malaise

Parlons concret. 72 % des ménages du Plateau sont locataires — c'est un quartier de locataires, pas de propriétaires. Et le loyer moyen d'un 4½ dépasse maintenant les 2 100 $ par mois. En janvier 2025, le Tribunal administratif du logement a recommandé une hausse de 5,9 %, la plus élevée en trente ans. Pour quelqu'un qui payait 1 200 $ depuis dix ans, ça représente un choc.

Entre 2022 et 2023, les évictions forcées ont augmenté de 132 % à Montréal. Le Plateau est en première ligne. Le Comité Logement du Plateau-Mont-Royal rapporte que près d'un quart de ses interventions concernent des reprises de logement ou des rénovictions — ce terme québécois qui décrit les propriétaires qui évincent leurs locataires sous prétexte de « rénovations majeures », pour ensuite relouer beaucoup plus cher.

Et voici le paradoxe que peu de gens comprennent : malgré l'image branchée et bohème du quartier, un tiers des résidents du Plateau vivent sous le seuil de pauvreté. La gentrification ne remplace pas juste des commerces par d'autres commerces. Elle pousse dehors des gens qui n'ont nulle part où aller.

## Ce qui résiste

Mais le Plateau n'est pas (encore) mort. Il y a une résistance qui s'organise, et elle est plus structurée qu'on ne le croit.

Le Comité Logement tient des séances d'information chaque semaine pour les locataires qui font face à des avis d'éviction. Les coopératives d'habitation se multiplient — c'est lent, c'est compliqué, mais c'est le seul modèle qui permet de garder des loyers abordables à long terme. Des groupes citoyens se battent contre le projet de loi 31, qu'ils accusent de fragiliser encore plus les protections des locataires.

Dans les ruelles, la culture survit aussi. Les murales se renouvellent chaque été pendant le festival MURAL. Les jardins communautaires continuent de pousser entre les clôtures. Les escaliers en colimaçon — ces escaliers extérieurs en fer forgé qui sont devenus le symbole du Plateau — sont toujours là, même si les façades derrière changent de mains.

<iframe width="560" height="315" src="https://www.youtube.com/embed/azBEsidypHo" title="Le Plateau-Mont-Royal, Montréal — Walking Tour 2025" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## La gentrification, vue d'en bas

Ce qui me frappe le plus quand je me promène dans le Plateau aujourd'hui, c'est la cohabitation de deux mondes qui ne se parlent pas. D'un côté de la rue, un restaurant gastronomique avec menu dégustation à 95 $. De l'autre, un organisme communautaire qui distribue des paniers alimentaires. Les deux existent dans le même quartier, à cinquante mètres l'un de l'autre, et leurs clientèles ne se croisent jamais.

Les nouveaux arrivants — jeunes professionnels, travailleurs du numérique, familles avec deux revenus — aiment le Plateau pour son authenticité. Mais cette authenticité repose sur des gens qui n'ont plus les moyens d'y rester. C'est le paradoxe fondamental de la gentrification, et le Plateau en est devenu le cas d'école montréalais.

## Et après ?

Le nouveau système de calcul des loyers, entré en vigueur en janvier 2026, utilise maintenant une formule simplifiée basée sur la moyenne de l'indice des prix à la consommation sur trois ans (3,1 % pour 2026). C'est plus simple, mais les organismes de défense des locataires s'inquiètent que ça ne soit pas suffisant pour freiner la spirale.

Le Plateau va continuer de changer. La question n'est plus de savoir si, mais pour qui. Est-ce que ce sera un quartier musée pour touristes et jeunes cadres, ou est-ce qu'il gardera cette mixité sociale qui en faisait un endroit unique en Amérique du Nord ?

Pour l'instant, la réponse se joue une ruelle, un bail, un comité citoyen à la fois.`,
      categoryId: catLocal.id,
      authorId: admin.id,
      published: true,
      publishedAt: new Date("2026-03-28"),
      views: 15200,
    },
    {
      title: "Griffintown : le quartier fantôme devenu le plus cher de la ville",
      slug: "griffintown-quartier-fantome-plus-cher-montreal",
      excerpt: "En moins de dix ans, Griffintown est passé de terrain vague industriel à quartier de condos de luxe. Radiographie d'une transformation spectaculaire.",
      imageUrl: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1200&q=80",
      content: `Il y a un exercice que je recommande à tous ceux qui veulent comprendre Montréal : prenez le canal de Lachine à vélo un dimanche matin, depuis le Vieux-Port en direction de l'ouest. Au bout de dix minutes, vous arrivez à Griffintown. Et là, vous comprenez.

D'un côté, des tours de condos en verre qui poussent comme des champignons après la pluie. De l'autre, les derniers bâtiments industriels en brique rouge du XIXe siècle. Au milieu, des terrains vagues qui attendent leur tour. Griffintown est un quartier qui se construit en temps réel, sous vos yeux, et le résultat est aussi fascinant que controversé.

## De friche industrielle à code postal de luxe

L'histoire est presque trop parfaite pour être vraie. Pendant un siècle, Griffintown a été le quartier ouvrier irlandais de Montréal — usines, entrepôts, familles modestes. Puis les usines ont fermé, les gens sont partis, et pendant trente ans, c'est devenu un terrain vague géant au sud du centre-ville.

Les promoteurs immobiliers ont vu l'opportunité vers 2010. Un quartier central, à cinq minutes à pied du Vieux-Port, le long du canal de Lachine, avec tout le « charme industriel » que les acheteurs de condos adorent. En moins de quinze ans, des milliers d'unités ont poussé. Le prix moyen d'un condo tourne maintenant autour de 500 000 $ en 2025, en hausse de 15 % en cinq ans. Les charges de copropriété dépassent souvent les 300 $ par mois. Et les grues ne s'arrêtent pas : le projet Bass 3, actuellement en construction, ajoutera 246 unités de luxe au paysage.

<iframe width="560" height="315" src="https://www.youtube.com/embed/_Sb0ptzg4Sg" title="Griffintown : le quartier le plus moderne et cher de Montréal" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Le quartier que tout le monde adore détester

Si vous mentionnez Griffintown dans un souper à Montréal, préparez-vous à des réactions fortes. C'est peut-être le quartier le plus polarisant de la ville.

Les critiques sont connues et souvent justifiées. Pendant longtemps, il n'y avait pas de véritable épicerie dans le quartier — un comble pour un endroit où vivent des milliers de personnes. C'est un peu mieux maintenant avec l'arrivée d'un Adonis et d'un Avril Supermarché Santé, mais ça reste mince. Il n'y a toujours pas d'école primaire dans le quartier. Les espaces verts se comptent sur les doigts d'une main. Et l'architecture est… disons, répétitive. Des tours de verre et de béton, les unes à côté des autres, avec des rez-de-chaussée commerciaux souvent vides.

Le reproche le plus fréquent, c'est l'absence d'âme. Griffintown a été construit pour des acheteurs, pas pour une communauté. Les gens vivent dans leurs condos, traversent le quartier en voiture, et n'ont pas vraiment de raison de s'arrêter sur un coin de rue pour jaser avec le voisin.

## Ce qu'on ne vous dit pas

Mais il y a un autre côté de l'histoire, et il mérite d'être raconté.

Le canal de Lachine est magnifique. En été, c'est l'un des plus beaux parcours à vélo de la ville — plat, ombragé, avec vue sur l'eau. Les restaurants le long de la rue Notre-Dame Ouest sont excellents : Joe Beef, Liverpool House, Vin Papillon. Ce n'est pas de la gastronomie pour touristes, c'est le cœur de la scène culinaire montréalaise.

Le marché Atwater est techniquement à la frontière du quartier, et c'est l'un des plus beaux marchés de la ville. La piste cyclable du canal relie Griffintown au Vieux-Port d'un côté et à Lachine de l'autre. Et les vieux bâtiments industriels qui restent — les greystones du XIXe siècle, les anciennes usines reconverties — donnent au quartier une texture architecturale que les tours neuves n'arriveront jamais à reproduire seules.

Il y a aussi une scène créative qui émerge. Des galeries d'art dans les anciens entrepôts, des studios de design, des espaces de coworking dans des bâtiments industriels. Griffintown n'est pas (encore) le Mile-End, mais ça bouge.

## Un quartier en chantier permanent

La vraie question avec Griffintown, ce n'est pas de savoir si c'est bien ou mal. C'est de savoir si le quartier va mûrir. En ce moment, c'est un adolescent : un peu maladroit, pas encore sûr de son identité, avec beaucoup de potentiel mais des choix discutables.

La station de REM promise pour le quartier reste incertaine. Si elle se concrétise, ça changerait la donne en matière de transport. Les espaces commerciaux vides au rez-de-chaussée des tours finiront (on l'espère) par se remplir. Et la prochaine génération de résidents — ceux qui auront des enfants, qui voudront un parc, une école, un dépanneur de quartier — va pousser pour que Griffintown devienne un vrai quartier, pas juste une collection de condos.

D'ici là, si vous voulez le voir avant qu'il soit fini, c'est maintenant. Il y a quelque chose de fascinant à regarder un quartier se construire en temps réel, avec toutes ses contradictions.`,
      categoryId: catLocal.id,
      authorId: author2.id,
      published: true,
      publishedAt: new Date("2026-03-26"),
      views: 11800,
    },
    {
      title: "Montréal souterrain : guide complet du RÉSO en 2026",
      slug: "montreal-souterrain-guide-reso-2026",
      excerpt: "33 kilomètres de tunnels, 1 600 commerces et 500 000 utilisateurs par jour. Tout ce qu'il faut savoir sur la ville sous la ville.",
      imageUrl: "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=1200&q=80",
      content: `Le RÉSO de Montréal est le plus grand réseau souterrain au monde. Et pourtant, même les Montréalais ne le connaissent pas entièrement.

## Un peu d'histoire

Inauguré en 1962 avec la Place Ville-Marie, le réseau souterrain s'est développé station par station, tour de bureaux par tour de bureaux. Aujourd'hui, il relie plus de 60 complexes commerciaux et résidentiels.

## Les chiffres qui impressionnent

- 33 km de tunnels piétonniers
- 10 stations de métro connectées
- 1 600 commerces et restaurants
- 500 000 personnes l'empruntent chaque jour en hiver
- Température constante de 22°C, même quand il fait -30°C dehors

## Nos passages préférés

Le tronçon entre Place des Arts et le Complexe Desjardins est le plus animé. Les murs accueillent régulièrement des expositions temporaires et des performances musicales.

Le passage entre la Gare Centrale et le Centre Bell est idéal les soirs de match — vous pouvez aller voir les Canadiens sans mettre le nez dehors.

## Le futur du RÉSO

La Ville a annoncé un investissement de 200 millions pour moderniser le réseau d'ici 2030. Au programme : meilleure signalisation, espaces verts intérieurs et connexion avec les nouvelles stations du REM.

## Le RÉSO au quotidien

Ce qui est fascinant avec le RÉSO, c'est que la plupart des Montréalais n'en connaissent qu'une fraction. Ils empruntent toujours le même tronçon — celui qui relie leur station de métro à leur bureau — et ignorent le reste. Mais si vous prenez le temps d'explorer, vous découvrirez des recoins surprenants : des expositions d'art temporaires, des fontaines intérieures, des passages qui débouchent sur des vues inattendues.

En hiver, le RÉSO devient un monde parallèle. Vous pouvez faire vos courses, manger, aller au cinéma, magasiner, et même aller voir un match des Canadiens au Centre Bell, tout ça sans jamais mettre le nez dehors. Quand il fait moins trente et que le vent souffle, ce n'est pas du luxe — c'est de la survie.

Un conseil pour les visiteurs : téléchargez une carte du RÉSO avant de vous y aventurer. Le réseau est immense et la signalisation, malgré les améliorations, reste parfois confuse. Se perdre dans le RÉSO est une expérience montréalaise classique — charmante la première fois, beaucoup moins la cinquième.`,
      categoryId: catLocal.id,
      authorId: admin.id,
      published: true,
      publishedAt: new Date("2026-03-20"),
      views: 7800,
    },
    {
      title: "Les ruelles vertes de Montréal : quand les citoyens reprennent la ville",
      slug: "ruelles-vertes-montreal-citoyens-reprennent-ville",
      excerpt: "Plus de 500 ruelles transformées en jardins communautaires. Portrait d'un mouvement qui redéfinit l'espace urbain.",
      imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80",
      content: `Entre les façades de briques et les escaliers en colimaçon, les ruelles de Montréal sont en train de devenir les plus beaux jardins de la ville.

## Un mouvement citoyen

Depuis 2010, plus de 500 ruelles ont été transformées en espaces verts grâce à l'initiative des résidents. Le programme « Ruelles vertes », soutenu par la Ville, permet aux voisins de débitumer, planter et entretenir leur ruelle.

## Comment ça fonctionne

Un groupe de résidents fait une demande à l'arrondissement. Si approuvée, la Ville finance le retrait de l'asphalte et fournit terre et plants. Les citoyens font le reste.

« On a commencé à quatre voisins, raconte Isabelle Morin, initiatrice de la ruelle Saint-André. Maintenant, c'est tout le bloc qui participe. On a des tomates, des fraises, des herbes aromatiques. Les enfants jouent dehors. C'est redevenu un village. »

## Les plus belles ruelles

- **Ruelle des Cœurs** (Rosemont) — Murales colorées et potagers communautaires
- **Ruelle Baldwin** (Plateau) — La plus photographiée, avec ses vignes grimpantes
- **Ruelle Demers** (Villeray) — Mini-forêt urbaine avec plus de 200 espèces

## L'impact mesurable

Les ruelles vertes réduisent les îlots de chaleur de 2 à 4°C en été. Elles absorbent l'eau de pluie et créent des corridors de biodiversité. Plus important encore : elles recréent du lien social dans des quartiers où les voisins ne se parlaient plus.

## Pourquoi ça marche

Ce qui rend le mouvement des ruelles vertes si inspirant, c'est qu'il vient d'en bas. Ce ne sont pas des urbanistes ou des politiciens qui ont eu l'idée — ce sont des voisins qui en avaient assez de voir un corridor d'asphalte derrière chez eux. Et le modèle est contagieux : chaque ruelle transformée donne envie au bloc d'à côté de faire pareil.

Si vous visitez Montréal en été, prenez une heure pour vous perdre dans les ruelles du Plateau ou de Rosemont. C'est gratuit, c'est beau, et ça raconte une histoire de la ville que vous ne trouverez dans aucun guide touristique — celle de citoyens ordinaires qui décident, une plante à la fois, de reprendre possession de leur espace.`,
      categoryId: catLocal.id,
      authorId: author2.id,
      published: true,
      publishedAt: new Date("2026-03-15"),
      views: 6200,
    },

    // ─── CULTURE ─────────────────────────────────────────────────────
    {
      title: "Festival de jazz 2026 : programmation, coups de cœur et soirées gratuites",
      slug: "festival-jazz-montreal-2026-programmation-complete",
      excerpt: "Plus de 3 000 artistes, 650 concerts et 450 spectacles gratuits. Tout ce qu'il faut savoir sur l'édition 2026 du festival.",
      imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&q=80",
      content: `Il y a un moment précis chaque année où Montréal devient la plus belle ville du monde. C'est fin juin, quand le soleil se couche tard, que l'air est tiède, et que le Quartier des spectacles se transforme en une immense scène à ciel ouvert. Des milliers de personnes assises sur le béton chaud, une bière à la main, pendant qu'un saxophoniste qu'elles ne connaissaient pas dix minutes plus tôt leur donne des frissons. C'est le Festival International de Jazz de Montréal, et si vous ne l'avez jamais vécu, vous ne pouvez pas vraiment dire que vous connaissez cette ville.

## Un festival qui dépasse le jazz

Commençons par clarifier quelque chose : le Festival de Jazz de Montréal n'est pas que du jazz. Ça l'a peut-être été dans les années 80, mais aujourd'hui c'est un festival de musique au sens large — soul, funk, blues, R&B, world music, pop, hip-hop, et oui, du jazz aussi. L'édition 2025 (la 45e) a accueilli Nas qui jouait Illmatic avec un orchestre, Thundercat, Ayra Starr, Ben Harper, Esperanza Spalding, Mavis Staples, et le Sun Ra Arkestra. C'est tout sauf un festival de niche.

L'édition 2026 se tiendra du 25 juin au 4 juillet. Les chiffres donnent le vertige : plus de 3 000 artistes, 30 pays représentés, 20 scènes, 600 spectacles dont 350 gratuits en plein air. Et chaque année, plus de deux millions de personnes passent par le site du festival. Deux millions. Pour un festival qui dure dix jours.

<iframe width="560" height="315" src="https://www.youtube.com/embed/tGhTnnQFEH8" title="Spectacles gratuits au Festival de Jazz de Montréal 2025" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Les spectacles gratuits : le vrai cœur du festival

Ce qui rend le Jazz Fest unique, c'est que les meilleurs moments ne coûtent rien. Chaque soir, de 20h à minuit, la place des Festivals se remplit. Les scènes extérieures accueillent des artistes de calibre international, et l'ambiance est incomparable. Pas de barrières VIP, pas de zones réservées. Vous posez votre couverture sur le sol, vous ouvrez une bière (oui, c'est permis), et vous écoutez.

Le moment magique, c'est quand un concert se termine et que des musiciens commencent à jammer spontanément dans un coin du site. Des pros et des amateurs qui se mélangent, un trompettiste qui rejoint un guitariste, quelqu'un sort un djembé. C'est impossible à planifier, impossible à reproduire, et c'est exactement ce qui fait la magie du festival.

L'an dernier, le guitariste sicilien Matteo Mancuso — 28 ans, déjà considéré comme l'un des meilleurs de sa génération — a donné une performance qui a laissé le public bouche bée. Kid Koala a monté un spectacle de marionnettes avec 75 marionnettes et 20 décors miniatures. Et Elisapie, la chanteuse inuk originaire du Nunavik, a rempli la plus grande scène extérieure. Ce genre de diversité, vous ne la trouverez dans aucun autre festival au monde.

## Les concerts en salle : l'autre festival

Parallèlement aux spectacles gratuits, il y a les concerts payants dans les salles du Quartier des spectacles — Place des Arts, Monument-National, Club Soda, et une dizaine d'autres venues. C'est là que vous verrez les grosses têtes d'affiche dans un cadre plus intime.

Le conseil que je donne à tout le monde : réservez tôt pour les concerts en salle (les meilleurs partent en quelques jours), mais gardez vos soirées flexibles pour les découvertes extérieures. Le vrai plaisir du Jazz Fest, c'est de se laisser surprendre par un artiste dont vous n'aviez jamais entendu parler.

## La scène locale qui rayonne

Le festival est aussi une vitrine extraordinaire pour les musiciens montréalais. La ville a une scène jazz et musicale parmi les plus riches en Amérique du Nord — grâce au programme de musique de McGill, au Conservatoire, et à une culture de jam sessions dans les bars qui forme des musiciens exceptionnels.

Des artistes comme Arooj Aftab (qui a fait ses études à Montréal), le collectif Nomad'Stones, et la pianiste Gentiane MG sont passés des petites salles montréalaises aux scènes internationales. Le festival leur donne une plateforme, et ils lui rendent en énergie et en créativité.

## Comment en profiter au max

Quelques conseils de quelqu'un qui y va chaque année. Pour les spectacles gratuits, arrivez vers 19h30 si vous voulez une bonne place — le site se remplit vite. Apportez une couverture ou une chaise pliante, de l'eau, et de la crème solaire (les dernières heures de jour tapent fort fin juin). Les meilleurs food trucks se trouvent le long de la rue Sainte-Catherine, et il y a des bars temporaires sur tout le site.

Pour les concerts de nuit dans les clubs — Le Dièse Onze, l'Upstairs Jazz Bar — c'est là que le jazz pur vit encore. Petites salles, musiciens à deux mètres de vous, cocktails corrects. C'est l'âme du festival, même si ce n'est pas la partie la plus visible.

Et si vous n'êtes jamais venu, faites-moi confiance : planifiez votre premier soir en arrivant tôt, sans programme précis, et laissez-vous porter par ce que vous entendez en marchant. Le Jazz Fest, ça se vit au feeling. Et le feeling, ici, ne déçoit jamais.`,
      categoryId: catCulture.id,
      authorId: admin.id,
      published: true,
      publishedAt: new Date("2026-03-27"),
      views: 13500,
    },
    {
      title: "L'art de rue à Montréal : carte des 30 plus belles murales de la ville",
      slug: "art-rue-montreal-carte-30-plus-belles-murales",
      excerpt: "Des ruelles du Mile-End aux murs de Saint-Henri, le street art montréalais s'impose comme l'un des meilleurs au monde.",
      imageUrl: "https://images.unsplash.com/photo-1569882234088-fa13d4c4f547?w=1200&q=80",
      content: `Montréal est devenue l'une des capitales mondiales du street art. Chaque été, le festival MURAL transforme le boulevard Saint-Laurent en galerie à ciel ouvert. Mais les plus belles œuvres se cachent souvent dans les endroits les plus inattendus.

## Le Top 10 à ne pas manquer

**1. « La Grande Dame »** — Boulevard Saint-Laurent / Sherbrooke. 15 étages de couleur, signée par l'artiste mexicain Saner.

**2. « Les oiseaux »** — Rue Clark, Mile-End. Dizaines d'oiseaux peints sur cinq façades consécutives par Ola Volo.

**3. « Portrait de Leonard Cohen »** — Rue Crescent. L'immense hommage au poète montréalais par El Mac et Gene Pendon.

**4. « Aurores boréales »** — Rue Wellington, Verdun. Installation lumineuse et murale qui change de couleur selon la lumière.

**5. « Femmes du monde »** — Rue Ontario, HoMa. Cinq portraits monumentaux de femmes de différentes cultures.

Le street art montréalais a cette qualité rare d'être à la fois accessible et profond. Ce ne sont pas juste des décorations sur des murs. Ce sont des œuvres qui racontent des histoires — l'immigration, la résistance, la culture autochtone, l'identité québécoise. Chaque murale est une conversation avec le quartier qui l'entoure.

## Les quartiers à explorer

- **Boulevard Saint-Laurent** entre Sherbrooke et Mont-Royal : la plus grande concentration
- **Ruelles du Mile-End** : l'art le plus spontané et underground
- **Saint-Henri** : les murales les plus politiques et engagées
- **HoMa (Hochelaga-Maisonneuve)** : la scène émergente

## Le festival MURAL

Du 6 au 16 juin 2026, le festival MURAL invite des artistes du monde entier à créer de nouvelles œuvres sur les murs du boulevard. Entrée libre. Les spectateurs peuvent regarder les artistes travailler en direct — c'est fascinant de voir une murale de cinq étages naître sous vos yeux en quelques jours.

Le meilleur moment pour visiter, c'est le dimanche matin. Les rues sont calmes, la lumière est belle pour les photos, et vous pouvez prendre votre temps devant chaque œuvre sans la foule des heures de pointe. Apportez un appareil photo et préparez-vous à marcher — un bon circuit des murales du boulevard Saint-Laurent fait facilement deux heures.`,
      categoryId: catCulture.id,
      authorId: author2.id,
      published: true,
      publishedAt: new Date("2026-03-22"),
      views: 8900,
    },
    {
      title: "Humour québécois : la relève qui fait rire le monde entier",
      slug: "humour-quebecois-releve-fait-rire-monde-entier",
      excerpt: "De Netflix aux scènes internationales, les humoristes québécois n'ont jamais été aussi populaires. Portrait de la nouvelle génération.",
      imageUrl: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1200&q=80",
      content: `L'humour a toujours été au cœur de la culture québécoise. Mais la nouvelle génération d'humoristes pousse les frontières plus loin que jamais.

## La révolution Netflix

En 2025, trois humoristes québécois ont décroché des spéciaux Netflix : Adib Alkhalidey, Virginie Fortin et Mehdi Bousaidan. Une première dans l'histoire de l'humour francophone.

## Les voix de la relève

**Coco Belliveau** — Son humour absurde et ses personnages déjantés remplissent les salles. « Je veux que les gens oublient qu'ils ont un problème d'hypothèque pendant 90 minutes. »

**Eddy King** — L'un des rares humoristes à faire ses spectacles en français et en anglais. Son set sur la vie d'immigrant à Montréal est devenu viral.

**Rosalie Vaillancourt** — Féministe, crue et hilarante. Son dernier spectacle « Grosse » a été nommé spectacle de l'année au Gala Les Olivier.

## Juste pour rire 2026

Le festival annonce sa plus grande édition. Plus de 1 500 spectacles en juillet, dont 200 en anglais et 50 en espagnol. La scène du Quartier Latin accueillera pour la première fois des humoristes d'Afrique francophone.

Ce qui rend l'humour québécois unique, c'est peut-être sa capacité à rire de lui-même. Les Québécois adorent se moquer de leur accent, de leur météo, de leur obsession pour la poutine et les rénovations. C'est un humour d'autodérision collective qui crée une complicité immédiate avec le public. Et quand cette autodérision rencontre les perspectives des nouveaux arrivants — comme dans les sets d'Eddy King sur la vie d'immigrant — ça donne quelque chose de profondément montréalais : un rire qui rapproche les cultures au lieu de les séparer.

Si vous êtes de passage à Montréal et que vous voulez découvrir la relève, cherchez les soirées de micro ouvert au Bordel Comédie Club sur le Plateau ou au Comedy Nest au centre-ville. L'entrée est souvent gratuite ou presque, et c'est là que les futures stars testent leur matériel. Vous rirez, c'est garanti — même si vous ne comprenez pas toutes les références au « dépanneur du coin ».`,
      categoryId: catCulture.id,
      authorId: author3.id,
      published: true,
      publishedAt: new Date("2026-03-18"),
      views: 7100,
    },

    // ─── GASTRONOMIE ─────────────────────────────────────────────────
    {
      title: "Les 10 meilleures poutines de Montréal : le guide définitif",
      slug: "10-meilleures-poutines-montreal-guide-definitif",
      excerpt: "On a mangé 47 poutines en 30 jours. Nos artères nous détestent, mais voici le classement que vous attendiez.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/La_Banquise_Poutine.jpg/960px-La_Banquise_Poutine.jpg",
      imageCredit: `Par <a rel="nofollow" href="https://www.flickr.com/people/7845551@N05">Yuri Long</a> from Arlington, VA, USA — <a rel="nofollow" href="https://www.flickr.com/photos/yurilong/4917518173/">road_trip-9349.jpg</a>, <a href="https://creativecommons.org/licenses/by/2.0" title="Creative Commons Attribution 2.0">CC BY 2.0</a>, via <a href="https://commons.wikimedia.org/w/index.php?curid=19029778">Wikimedia Commons</a>`,
      content: `Il y a des sujets sur lesquels les Montréalais ne rigolent pas. La politique, le hockey, et la poutine. Surtout la poutine. Dites à quelqu'un que vous préférez la poutine de tel endroit plutôt que de tel autre, et vous risquez de perdre un ami. C'est comme ça ici. La poutine, c'est sérieux.

J'ai passé un mois — un long mois — à manger de la poutine à travers la ville. Mes artères me détestent, mon pantalon ne ferme plus, mais j'ai un classement et je suis prêt à le défendre.

## Ce qui fait une grande poutine

Avant de parler des adresses, il faut parler de ce qui compte. Une poutine, c'est trois ingrédients : des frites, du fromage en grains, et de la sauce. C'est tout. Et c'est exactement parce que c'est simple que c'est difficile à réussir.

Les frites doivent être croustillantes à l'extérieur et moelleuses à l'intérieur. Si elles sont molles, c'est fini. Le fromage en grains doit être frais du jour — quand vous mordez dedans, il doit faire « couic-couic » entre vos dents. Si votre fromage ne couine pas, ce n'est pas du fromage en grains. Et la sauce doit être maison, brune, onctueuse, avec ce goût de rôti qui colle au palais. Pas de sauce en poudre, pas de gravy en boîte.

Tout le reste — les garnitures, les variations, les « poutines gastronomiques » — c'est du bonus. La base, c'est sacré.

## Les adresses qui comptent

**La Banquise** — On commence par l'évidence. Rue Rachel, dans le Plateau, ouverte 24 heures sur 24. C'est l'institution. Plus de 30 variétés au menu, de la classique à la T-Rex (steak haché, pepperoni, bacon, saucisses hot-dog). Mais honnêtement, la meilleure chose à faire ici c'est de commander la classique. Les frites sont parfaites, le fromage est toujours frais, et la sauce est exactement ce qu'elle doit être. Il y a une file d'attente dehors presque chaque soir, et c'est mérité.

<iframe width="560" height="315" src="https://www.youtube.com/embed/spibNyNplQs" title="The Ultimate Montreal Poutine Battle" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

**Ma Poule Mouillée** — C'est ici que la poutine rencontre le poulet portugais, et le résultat est spectaculaire. Le restaurant est minuscule — une dizaine de places assises, maximum — sur la rue Rachel Est. La poutine au poulet avec fromage São Jorge et chorizo est probablement la meilleure variation de poutine que j'ai mangée. Le problème, c'est que tout le monde le sait, et la file d'attente est parfois ridicule. Venez en semaine si vous pouvez.

**Patati Patata** — La « Friterie de Luxe » sur le boulevard Saint-Laurent. C'est un comptoir microscopique qui existe depuis plus de vingt ans, et qui n'a jamais changé. La poutine est simple, honnête, et magnifiquement exécutée. C'est aussi l'un des rares endroits où vous pouvez manger une excellente poutine végétarienne. L'ambiance tient du trésor caché — si vous ne connaissez pas, vous passez devant sans le voir.

**Chez Claudette** — Institution du Mile-End depuis 1982. Cinquante types de poutine au menu. C'est le genre d'endroit où les habitués ont « leur » poutine et ne commandent jamais autre chose. La galvaude (poulet, petits pois, sauce) est un classique ici. L'endroit est sans prétention, les portions sont généreuses, et le fromage est toujours frais.

**Au Pied de Cochon** — La poutine au foie gras de Martin Picard. C'est excessif, c'est décadent, c'est cher, et c'est une expérience que tout amateur de poutine devrait vivre au moins une fois. Le foie gras poêlé fond sur les frites et le fromage, et la sauce au fond du plat est un truc qu'on n'oublie pas. Ce n'est pas une poutine de tous les jours. C'est une poutine d'occasion spéciale.

## La Poutine Week

Chaque année, des dizaines de restaurants à travers Montréal et le Québec participent à la Poutine Week — une semaine où chaque restaurant crée sa propre version originale. C'est l'occasion de goûter des combinaisons improbables : poutine au butter chicken, poutine au canard confit, poutine dessert au Nutella (oui, ça existe, et non, je ne recommande pas). Suivez @lapoutineweek sur Instagram pour les dates et les participants.

## Le grand débat

Il y a deux guerres de religion autour de la poutine à Montréal. La première : sauce brune ou sauce BBQ ? Les puristes ne jurent que par la brune. Les rebelles aiment la BBQ, plus sucrée, plus vinaigrée. Personnellement, je suis team brune, mais je respecte l'autre camp (à distance).

La deuxième : est-ce qu'une poutine avec des garnitures folles est encore une poutine, ou est-ce que c'est autre chose ? Les traditionalistes disent que la vraie poutine, c'est frites-fromage-sauce, point final. Les progressistes disent que la poutine est un canevas, et que tout est permis. Ce débat ne sera jamais résolu, et c'est très bien comme ça.

## Un dernier mot

Si vous visitez Montréal et que vous ne mangez qu'une seule poutine, allez à La Banquise. Si vous en mangez deux, ajoutez Ma Poule Mouillée. Et si vous êtes prêt à vendre votre âme pour une expérience culinaire extrême, Au Pied de Cochon.

Mais peu importe où vous allez, mangez votre poutine sur place, chaude, tout de suite. Une poutine qui attend, c'est une poutine qui meurt. Les frites ramollissent, le fromage arrête de couiner, la sauce refroidit. La poutine, ça se mange dans l'urgence. C'est un plat pressé, un plat vivant, un plat qui ne tolère pas la patience.

Comme Montréal, finalement.`,
      categoryId: catGastro.id,
      authorId: admin.id,
      published: true,
      publishedAt: new Date("2026-03-25"),
      views: 18700,
    },
    {
      title: "Brunch à Montréal : les 8 adresses qui valent l'attente",
      slug: "brunch-montreal-8-adresses-valent-attente",
      excerpt: "Le brunch est une religion à Montréal. Voici les temples où il faut aller prier le dimanche matin.",
      imageUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1200&q=80",
      content: `Le dimanche matin à Montréal, il se passe quelque chose d'étrange. Des milliers de personnes se lèvent plus tôt que pendant la semaine, enfilent leurs vêtements les plus « casual chic », et vont faire la file dehors devant un restaurant. Parfois trente minutes. Parfois une heure. En hiver, à moins quinze. Pour des œufs.

C'est le brunch montréalais. Et si vous n'avez pas encore compris, c'est parce que vous ne l'avez pas encore vécu. Ici, le brunch n'est pas un repas. C'est un rituel, une sortie sociale, presque une religion.

## Pourquoi Montréal est la capitale du brunch

Ce n'est pas moi qui le dis — plusieurs médias culinaires nord-américains ont sacré Montréal « capitale du brunch du continent ». Et honnêtement, c'est difficile de les contredire. La combinaison de la culture café européenne (héritage français), de l'obsession pour la bouffe locale, et d'une scène de restos qui se renouvelle constamment crée un terreau parfait.

Ce qui distingue le brunch montréalais, c'est que même les petits restos de quartier prennent ça au sérieux. Ce n'est pas juste des œufs et du bacon (même si un bon bacon érable, ça ne fait jamais de mal). C'est de la brioche maison, du saumon fumé artisanal, des conserves de fruits faites sur place, du sirop d'érable de la dernière récolte. Il y a un niveau de soin dans le brunch montréalais qui est assez unique.

## Les adresses qui valent la file

**Olive et Gourmando** — Si je ne devais recommander qu'un seul endroit pour bruncher dans cette ville, ce serait Olive et Gourmando, dans le Vieux-Montréal. C'est une institution depuis 1997, et ça ne s'essouffle pas. Les viennoiseries sont folles, les sandwichs du midi sont légendaires, et le café est excellent. L'endroit est toujours bondé, et il n'y a pas de réservation. Arrive tôt ou prépare-toi à attendre.

**Fabergé** — Dans le Mile-End, Fabergé a poussé le concept du brunch créatif au maximum. Les œufs bénédictine se déclinent en dizaines de variantes, et la breakfast poutine — frites maison, œuf poché, hollandaise — est une invention qui n'aurait pu naître qu'à Montréal. Le décor est coloré, bruyant, et joyeux. C'est le genre d'endroit où on passe deux heures sans voir le temps.

**Larry's** — Un autre bijou du Mile-End. Petit, cozy, avec une cuisine ouverte et un menu qui change. Le saumon fumé maison est exceptionnel. Larry's a ce talent rare de faire des choses simples de manière parfaite, sans en faire un spectacle. Le brunch ici a un côté familial, comme si vous mangiez chez un ami qui cuisine vraiment bien.

**Tiramisu** — Le choix surprenant de la liste. Un restaurant italo-japonais dans le Chinatown qui sert un brunch de fusion complètement déjanté : pizza au saumon fumé, pain doré au miso, des combinaisons que vous ne trouverez nulle part ailleurs. C'est créatif sans être prétentieux, et les prix sont raisonnables.

**Lémeac** — Pour les dimanches où vous voulez vous sentir un peu fancy. Cette brasserie française de l'avenue Laurier fait un brunch classique — omelettes, tartares, viennoiseries — avec une exécution impeccable. La salle est belle, le service est professionnel, et le café au lait arrive dans une tasse en porcelaine. Ça change du café dans un pot Mason.

## Les quartiers à bruncher

Chaque quartier de Montréal a sa propre culture de brunch. Le Mile-End est le territoire des brunchs créatifs et un peu hipster. Le Plateau a les classiques indémodables. Le Vieux-Montréal est plus touristique mais avec quelques perles. Verdun monte en puissance avec de nouvelles adresses sur Wellington. Et Rosemont cache des trésors que les guides ne mentionnent pas encore.

Mon conseil : ne restez pas dans le même quartier chaque dimanche. Le brunch, c'est aussi une excuse pour explorer la ville. Prenez le métro, marchez un peu, découvrez un coin que vous ne connaissez pas. La meilleure table de brunch de Montréal est probablement celle que vous n'avez pas encore trouvée.

## Comment survivre à la file d'attente

Quelques stratégies que j'ai apprises par expérience. D'abord, arrivez avant 10h. La fenêtre entre 9h et 9h30, c'est le moment idéal — les vrais lève-tôt sont déjà installés, et la foule du dimanche paresseux n'est pas encore arrivée.

Ensuite, certains restos acceptent maintenant les réservations en ligne. Utilisez-les. C'est un changement relativement récent dans la culture du brunch montréalais — pendant longtemps, l'idée de réserver pour un brunch était presque choquante — mais la réalité des files d'attente de 45 minutes a fini par imposer le pragmatisme.

Et si vous devez attendre, prenez ça comme un Montréalais : allez chercher un café au coin de la rue, jasez avec les gens dans la file, regardez le quartier se réveiller. La file d'attente, ici, ça fait partie du rituel.

## Le brunch parfait

Le brunch parfait à Montréal, ce n'est pas celui avec le menu le plus long ou le décor le plus instagrammable. C'est celui où le café est bon, où les œufs sont cuits exactement comme vous les aimez, où le pain est frais du matin, et où vous pouvez rester assis deux heures sans que personne ne vous pousse vers la sortie.

C'est un endroit où le serveur vous appelle « mon chou » sans que ce soit condescendant, où la lumière du dimanche matin entre par les grandes fenêtres, et où le bruit des conversations autour de vous devient une musique de fond agréable.

Ça existe, cet endroit. Il y en a des dizaines à Montréal. Il suffit de les chercher un dimanche à la fois.`,
      categoryId: catGastro.id,
      authorId: author2.id,
      published: true,
      publishedAt: new Date("2026-03-21"),
      views: 12400,
    },
    {
      title: "La scène café de Montréal : pourquoi c'est la meilleure en Amérique du Nord",
      slug: "scene-cafe-montreal-meilleure-amerique-nord",
      excerpt: "Des micro-torréfacteurs aux bars à espresso, Montréal est devenue la capitale du café de spécialité. On vous explique pourquoi.",
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
      content: `Il y a un test que j'utilise pour évaluer une ville : la qualité du café dans un café au hasard, pas le meilleur café de la ville, juste un café choisi au hasard en marchant dans la rue. À Montréal, ce café au hasard est presque toujours bon. Souvent excellent. Et ça, ça veut dire quelque chose.

La scène café montréalaise a explosé ces dix dernières années, au point où des magazines spécialisés comme Sprudge — la bible mondiale du café de spécialité — placent régulièrement Montréal parmi les meilleures villes café en Amérique du Nord. Devant Seattle. Devant Portland. Et si vous êtes sceptique, je vous comprends. Mais laissez-moi vous expliquer pourquoi c'est mérité.

## Pourquoi Montréal, justement ?

Il y a trois raisons qui expliquent pourquoi la scène café est aussi forte ici. La première, c'est l'héritage européen. Montréal a une culture du café qui vient de sa tradition française — s'asseoir dans un café, prendre son temps, regarder les gens passer. Ce n'est pas du café à emporter avalé dans le métro. C'est du café comme moment de la journée.

La deuxième, c'est le port. Le port de Montréal est l'un des plus importants au Canada, et c'est par là que transitent les grains verts de café qui arrivent d'Amérique centrale, d'Afrique, d'Asie. Les torréfacteurs montréalais ont un accès direct à des grains de qualité, et ça se goûte.

La troisième, c'est la clientèle. Les Montréalais sont exigeants en matière de bouffe et de boisson. Quand un café sert un espresso médiocre, les gens ne reviennent pas. Cette pression naturelle a tiré toute la scène vers le haut.

## Les torréfacteurs qui comptent

**Café Saint-Henri** — Ce sont les pionniers du café de spécialité à Montréal. Ils torréfient depuis 2011, et leurs grains se retrouvent dans les meilleurs restaurants et hôtels de la ville. Leur café sur la rue Notre-Dame Ouest, à Saint-Henri, est un endroit magnifique — ancien espace industriel, grands plafonds, lumière naturelle. Mais c'est surtout dans la tasse que ça se passe. Leur espresso est équilibré, complexe, et constamment bon.

**Dispatch Coffee** — L'approche scientifique du café. Dispatch traite le café comme un vin : terroir, altitude, méthode de traitement, profil de torréfaction. Chaque sac est accompagné de notes de dégustation détaillées. Si vous êtes le genre de personne qui aime comprendre ce qu'elle boit, c'est votre torréfacteur.

**Zab Café** — Le petit nouveau qui monte. Torréfaction plus légère, notes fruitées et florales, c'est du café « troisième vague » dans toute sa splendeur. Leur micro-torréfaction change régulièrement, et chaque lot a sa personnalité. C'est le café pour ceux qui veulent être surpris.

## Les cafés où il faut aller

**Crew Collective & Café** — Il faut commencer par celui-là, parce que c'est probablement le plus beau café au Canada, et peut-être en Amérique du Nord. Installé dans l'ancien siège de la Banque Royale du Canada — un bâtiment néoclassique des années 1920 avec des plafonds de quinze mètres, des colonnes de marbre, et des lustres dorés — Crew Collective est un espace de travail et un café dans un décor de film. Le café est excellent (grains de Saint-Henri), le wifi est rapide, et l'ambiance est à mi-chemin entre une bibliothèque et un palace. Forbes l'a nommé l'un des plus beaux espaces de coworking au monde, et pour une fois, le titre est mérité.

**Tommy** — Dans la Petite-Patrie, Tommy est le café des freelances et des créatifs. Grand, lumineux, calme, avec un espresso impeccable et une politique non dite de « restez aussi longtemps que vous voulez ». C'est le genre d'endroit où vous venez pour une heure et vous partez cinq heures plus tard en vous demandant où le temps est passé.

**Pikolo Espresso Bar** — Le comptoir le plus minuscule de la ville avec le meilleur espresso. C'est un bar à espresso au sens strict : un comptoir, une machine, quelques tabourets. Pas de place pour un laptop. Juste un café, debout ou assis, en regardant le barista travailler. C'est le café dans sa forme la plus pure et la plus italienne.

## La culture café, au-delà de la tasse

Ce qui rend la scène café montréalaise spéciale, ce n'est pas juste la qualité du café. C'est la culture autour. Les cafés montréalais sont des lieux de vie. Des gens y travaillent toute la journée. Des couples s'y retrouvent le dimanche matin. Des étudiants y passent leurs soirées. Des artistes y gribouillent dans des cahiers.

Et contrairement à d'autres villes où la culture « laptop » dans les cafés est mal vue, à Montréal c'est accepté et même encouragé. La plupart des cafés indépendants offrent le wifi gratuit, des prises de courant partout, et ne vous regardent pas de travers si vous commandez un seul café en trois heures. C'est un pacte social implicite : le café vous offre un espace, et vous, vous revenez.

C'est peut-être ça, finalement, le secret de la scène café montréalaise. Ce n'est pas juste du bon café. C'est du bon café dans des endroits où on a envie de rester. Et dans une ville où l'hiver dure cinq mois, avoir un endroit chaud, beau, et bien caféiné où passer ses journées, c'est un luxe qui n'a pas de prix.`,
      categoryId: catGastro.id,
      authorId: author3.id,
      published: true,
      publishedAt: new Date("2026-03-14"),
      views: 8200,
    },

    // ─── SOCIÉTÉ ─────────────────────────────────────────────────────
    {
      title: "Crise du logement à Montréal : les solutions qui marchent (et celles qui ne marchent pas)",
      slug: "crise-logement-montreal-solutions-qui-marchent",
      excerpt: "Colocation, coopératives, tiny houses — portrait des Montréalais qui inventent de nouvelles façons de se loger.",
      imageUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
      content: `Je vais vous raconter une scène que j'ai vue trois fois cet hiver. Un couple dans la trentaine, avec un enfant, qui visite un 4½ dans Rosemont. Le logement est correct sans être exceptionnel — cuisine fermée, planchers de bois un peu abîmés, salle de bain d'époque. Le propriétaire demande 1 800 $ par mois. Le couple hésite deux secondes, et quelqu'un d'autre derrière eux dit oui. Le logement est parti en quinze minutes.

C'est ça, la crise du logement à Montréal en 2026. Ce n'est plus une expression abstraite ou un sujet de débat télévisé. C'est la réalité quotidienne de centaines de milliers de personnes qui se battent pour garder un toit décent au-dessus de leur tête.

## Les chiffres qui font mal

Le taux d'inoccupation à Montréal est remonté à 2,9 % en 2025 — une légère amélioration par rapport au 2,1 % de 2024. Mais ce chiffre global masque une réalité beaucoup plus dure. Pour les logements abordables — les loyers les plus bas du marché — le taux d'inoccupation est de 0,8 %. Autrement dit, il n'y a presque rien de disponible pour les gens qui ont le plus besoin de se loger.

Le loyer moyen d'un 4½ dans le Grand Montréal atteint 1 346 $ par mois en 2025, en hausse de 7,2 % en un an. Et pour les logements construits après 2015 — les immeubles neufs, les condos locatifs — le loyer moyen dépasse 1 880 $. En 2025, les loyers à Montréal ont augmenté de plus de 10 % globalement. Un ménage locataire sur quatre a des problèmes d'abordabilité — il consacre plus de 30 % de son revenu au loyer.

Ce qui est pervers dans cette crise, c'est qu'elle est à deux vitesses. Il y a des logements disponibles, mais ils ne sont pas pour les gens qui en ont besoin. Le taux d'inoccupation pour les unités de luxe (immeubles neufs) est de 5,6 %. Il y a des condos vides qui attendent des locataires à 2 000 $ par mois, pendant que des familles s'entassent dans des 3½ insalubres parce qu'elles ne trouvent rien d'autre.

## Ce qui ne marche pas

Le nouveau système de calcul des loyers, entré en vigueur le 1er janvier 2026, utilise une formule simplifiée basée sur la moyenne de l'indice des prix à la consommation sur trois ans — 3,1 % pour 2026. C'est plus clair que l'ancien système qui comptait douze indicateurs différents, mais les organismes de défense des locataires comme le FRAPRU considèrent que c'est insuffisant.

La Ville de Montréal a investi 1,5 million de dollars pour soutenir les locataires — une somme qui fait sourire quand on la compare à l'ampleur du problème. Les critiques du budget provincial 2025-2026 pointent l'absence de nouvelles mesures structurelles pour le logement. Pas de registre national des loyers (promis depuis des années). Pas d'encadrement strict des hausses. Pas de protection réelle contre les rénovictions.

Et les 26 000 appartements locatifs actuellement en construction ne régleront pas le problème, parce que la grande majorité sont des logements haut de gamme. Construire des condos de luxe dans Griffintown ne loge pas une famille de Parc-Extension qui cherche un 5½ à 1 200 $.

## Ce qui marche (un peu)

Les coopératives d'habitation restent le modèle le plus prometteur pour le logement abordable à long terme. Dans une coop, les résidents sont collectivement propriétaires de l'immeuble, et les loyers sont fixés en fonction des coûts réels, pas du marché. Le problème, c'est que les listes d'attente sont interminables — souvent cinq ans ou plus — et que créer une nouvelle coop demande un niveau d'organisation et de financement que peu de groupes citoyens ont.

La colocation gagne aussi du terrain, pas par choix mais par nécessité. Des plateformes spécialisées mettent en relation des colocataires potentiels, et le modèle de « coliving » — chambre privée, espaces communs partagés, tout inclus — attire de plus en plus de jeunes professionnels qui ne peuvent pas se permettre un logement seul.

Et puis il y a les initiatives plus marginales. Des communautés de tiny houses dans les Laurentides et sur la Rive-Sud, avec des unités à 60 000-90 000 $. Des projets de conversion d'espaces commerciaux vacants en logements. Des groupes de citoyens qui rachètent des immeubles pour les sortir du marché spéculatif. C'est petit, c'est lent, mais ça existe.

## Le vrai problème

La crise du logement à Montréal n'est pas un problème de bâtiments. C'est un problème politique. On construit beaucoup, mais on construit pour les mauvaises personnes. Le marché répond à la demande solvable — des professionnels qui peuvent payer 1 800 $ de loyer — et ignore complètement la demande réelle — des familles, des étudiants, des retraités, des nouveaux arrivants qui ont besoin de logements décents à des prix humains.

Tant que la construction de logements restera entièrement entre les mains du marché privé, cette crise ne se résoudra pas. Les solutions existent — logement social, coopératives, encadrement des loyers — mais elles demandent une volonté politique qui, pour l'instant, n'est pas au rendez-vous.

En attendant, les Montréalais continuent de faire la file pour visiter des logements médiocres à des prix fous. Et chaque 1er juillet, la grande valse du déménagement ressemble de plus en plus à un jeu de chaises musicales où il manque toujours plus de chaises.`,
      categoryId: catSociete.id,
      authorId: admin.id,
      published: true,
      publishedAt: new Date("2026-03-23"),
      views: 10900,
    },
    {
      title: "Mobilité à Montréal : le REM change-t-il vraiment la donne ?",
      slug: "mobilite-montreal-rem-change-donne",
      excerpt: "Un an après l'ouverture de la première phase du REM, on fait le bilan. Promesses tenues, déceptions et impact réel sur la vie des Montréalais.",
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80",
      content: `Le 17 novembre 2025, quelque chose de rare s'est produit à Montréal : un projet d'infrastructure a ouvert à temps. La deuxième phase du REM — le tunnel du Mont-Royal et la branche vers Deux-Montagnes — a été inaugurée officiellement le 14 novembre en présence du premier ministre Mark Carney, du premier ministre du Québec François Legault et de la mairesse de Montréal. Trois jours plus tard, les premiers passagers montaient à bord.

Pour une ville habituée aux retards olympiques de ses grands projets de transport, c'était presque choquant. Et après quelques mois d'utilisation, le verdict des usagers commence à se dessiner.

## Ce que c'est, au juste

Pour ceux qui ne suivent pas le dossier, le REM (Réseau express métropolitain) est un métro léger automatisé — sans conducteur — qui relie le centre-ville de Montréal à la banlieue. Le réseau actuel compte 19 stations réparties sur 50 kilomètres, avec deux branches en service : la branche Sud (vers Brossard, via le pont Champlain) et la branche Nord (vers Deux-Montagnes, via le tunnel du Mont-Royal).

La prochaine ouverture prévue, c'est la branche de l'Anse-à-l'Orme vers l'Ouest de l'île, avec quatre nouvelles stations, programmée pour le 18 mai 2026. Si tout va bien.

<iframe width="560" height="315" src="https://www.youtube.com/embed/yrvFFVXZY8o" title="REM Montreal - Full System Ride POV 2025" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Ce qui marche vraiment

Le trajet Brossard–Gare Centrale est devenu la success story du projet. Les gens de la Rive-Sud qui passaient une heure dans le trafic sur le pont Champlain font maintenant le trajet en vingt minutes, assis, avec le wifi. L'achalandage moyen tourne autour de 75 000 déplacements par jour, avec des pointes à près de 98 000. La branche Sud seule a atteint 45 000 usagers en une journée de pointe en février 2025.

La réaction des usagers est globalement positive, et même enthousiaste pour certains. Un titre de la Presse Canadienne résumait bien le sentiment : « Truly incredible ». Pour les navetteurs de banlieue, le REM a réellement changé leur quotidien. Quand vous passez d'une heure de voiture stressante à vingt minutes de train en lisant un livre, c'est difficile de ne pas être convaincu.

Les trains sont propres, modernes, climatisés. Les portes palières sur les quais (comme dans un aéroport) empêchent les accidents. Le système est entièrement automatisé, ce qui signifie des départs fréquents aux heures de pointe. Et les stations, même si certains les trouvent froides architecturalement, sont fonctionnelles et accessibles.

## Ce qui déçoit

Tout n'est pas rose, et les critiques méritent d'être entendues.

La fréquence en heures creuses reste un irritant. Attendre huit à douze minutes un train automatisé, dans une station vide, ça ne donne pas l'impression d'un service « express ». Le métro traditionnel de la STM passe plus souvent, et ça crée une comparaison défavorable.

L'intégration avec le réseau de bus est perfectible. Plusieurs stations sont mal connectées aux lignes d'autobus locales, ce qui force les usagers à marcher ou à prendre un deuxième transport pour rejoindre leur destination finale. Le fameux « dernier kilomètre » reste un problème.

Et l'architecture des stations divise. Certaines sont vraiment belles — la station Gare Centrale, intégrée au RÉSO souterrain, est impressionnante. Mais d'autres ressemblent davantage à un terminal d'aéroport qu'à un lieu de vie urbain. C'est fonctionnel, mais ça manque d'âme.

## L'impact sur les quartiers

C'est peut-être l'effet le plus significatif du REM, et pas nécessairement positif. Les quartiers autour des stations connaissent une flambée immobilière. Les prix des propriétés ont grimpé de 15 à 25 % dans un rayon de 500 mètres autour des nouvelles stations. Des terrains qui ne valaient rien il y a cinq ans sont devenus des emplacements de choix pour les promoteurs immobiliers.

C'est la mécanique classique du transport en commun : chaque nouvelle ligne de métro ou de train crée de la valeur foncière. Le problème, c'est que cette valeur est captée par les propriétaires et les promoteurs, pas par la communauté. Les locataires autour des stations voient leurs loyers augmenter, et certains sont poussés dehors par la pression immobilière que le REM a lui-même créée.

## Et les vélos dans tout ça ?

Le REM n'est pas le seul acteur de la mobilité à Montréal. Le réseau cyclable continue de s'étendre — plus de 50 kilomètres de pistes protégées ajoutés en 2025 — et le système BIXI compte maintenant plus de 12 000 vélos, dont 2 500 électriques. L'abonnement annuel reste à 99 $, ce qui en fait l'un des systèmes de vélo-partage les plus abordables en Amérique du Nord.

La combinaison REM + vélo pourrait devenir le modèle de mobilité dominant à Montréal dans les prochaines années : le train pour les longues distances, le vélo pour le dernier kilomètre. C'est déjà ce que font beaucoup de navetteurs, et l'infrastructure suit.

## Le verdict

Le REM est-il parfait ? Non. Est-ce qu'il change la donne ? Pour les navetteurs de la Rive-Sud et de la couronne Nord, absolument. Pour le reste de la ville, c'est encore trop tôt pour le dire — les prochaines branches (Ouest de l'île, éventuellement l'Est) détermineront si le REM devient un vrai réseau métropolitain ou reste une belle ligne de banlieue.

Mais une chose est certaine : pour la première fois depuis longtemps, Montréal a un projet de transport qui fonctionne, qui est à l'heure, et qui rend la vie des gens meilleure. Dans une ville qui a été traumatisée par le fiasco de l'échangeur Turcot et les retards du métro, c'est déjà beaucoup.`,
      categoryId: catSociete.id,
      authorId: author2.id,
      published: true,
      publishedAt: new Date("2026-03-19"),
      views: 8400,
    },
    {
      title: "Immigration à Montréal : ces entrepreneurs qui transforment la ville",
      slug: "immigration-montreal-entrepreneurs-transforment-ville",
      excerpt: "De la restauration à la tech, les immigrants créent des entreprises et des emplois. Cinq histoires inspirantes.",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
      content: `Si vous voulez comprendre ce qui rend Montréal différente des autres villes nord-américaines, ne regardez pas les gratte-ciels ou les festivals. Allez manger. Allez dans un petit restaurant libanais de Côte-des-Neiges un vendredi soir. Allez manger des dim sum dans le Chinatown un dimanche matin. Allez essayer le nouveau restaurant péruvien du Quartier latin, celui dont tout le monde parle sur Instagram. Derrière chacune de ces tables, il y a quelqu'un qui est arrivé ici avec une valise et une idée, et qui a construit quelque chose.

L'histoire de Montréal est une histoire d'immigration. Et les entrepreneurs immigrants ne sont pas un chapitre de cette histoire — ils en sont le moteur principal.

## Les chiffres qu'on ne dit pas assez

Au Canada, les immigrants représentent 32 % de tous les propriétaires d'entreprises avec des employés salariés. C'est un chiffre national, mais à Montréal, l'impact est encore plus visible. Et quand on regarde le secteur de la restauration et de l'alimentation — le secteur qui donne à Montréal son identité culinaire — 51 % des propriétaires d'entreprises sont des immigrants. Plus de la moitié. La poutine est québécoise, mais la moitié de la scène gastronomique montréalaise a été construite par des gens nés ailleurs.

Le secteur tech aussi doit beaucoup à l'immigration. Montréal est devenue un hub d'intelligence artificielle et de jeux vidéo en partie grâce à sa capacité d'attirer des talents internationaux. Les investissements en capital de risque dans la métropole ont dépassé 1,3 milliard de dollars en 2024, répartis sur 85 transactions. Une part significative de ces startups a été fondée ou cofondée par des immigrants.

## Des histoires vraies

**Antonio Park** est né en Argentine de parents coréens. Il a immigré à Montréal en 1990, a travaillé comme plongeur, puis comme cuisinier, puis a voyagé au Japon pour apprendre la cuisine japonaise. De retour à Montréal, il a ouvert Park, un restaurant de sushis sur la rue Victoria, qui est devenu l'un des meilleurs restaurants de la ville. Il a depuis ouvert Lavanderia et plusieurs autres adresses. Son parcours — Argentine, Corée, Japon, Montréal — est l'histoire de Montréal en une seule personne.

**Aldo Bensadoun**, né au Maroc, a fondé le Groupe ALDO à Montréal. Ce qui a commencé comme un concession de chaussures dans un magasin de Montréal est devenu une entreprise qui opère dans plus de 100 pays. Le siège social est toujours à Montréal, et l'entreprise emploie des milliers de personnes.

Et puis il y a les histoires moins connues mais tout aussi significatives. L'entrepreneur péruvien qui a commencé comme plongeur dans un restaurant du Quartier latin, qui a appris la cuisine québécoise, la cuisine française, la cuisine italienne, et qui a fini par ouvrir son propre restaurant en fusionnant toutes ces influences avec la cuisine de son pays. Ou la femme sénégalaise qui a ouvert une boutique de mode sur Wellington à Verdun, mêlant tissus africains et coupes montréalaises, et qui est devenue un point de rencontre pour toute la communauté.

Ces histoires ne sont pas exceptionnelles. Elles sont la norme. Montréal a cette capacité particulière d'accueillir des gens, de leur donner un espace pour essayer des choses, et de récompenser ceux qui prennent des risques créatifs.

## Pourquoi Montréal ?

Il y a quelque chose dans cette ville qui favorise l'entrepreneuriat immigrant, et c'est une combinaison de facteurs pratiques et culturels.

Le coût de la vie est plus bas qu'à Toronto ou Vancouver, ce qui signifie que le risque de se lancer en affaires est moins grand. Un local commercial sur une rue secondaire du Plateau coûte une fraction de ce qu'il coûterait dans un quartier équivalent à Toronto. Et les Montréalais sont ouverts à essayer des choses nouvelles — un restaurant éthiopien dans Parc-Extension, une boulangerie japonaise dans le Mile-End, un café colombien à Villeray. Ici, la curiosité culinaire et culturelle est la norme, pas l'exception.

Il y a aussi le bilinguisme. Un immigrant qui parle français a un avantage naturel au Québec, mais Montréal est suffisamment bilingue pour que les anglophones puissent aussi se lancer. C'est une porte d'entrée unique en Amérique du Nord — une ville qui donne accès au marché francophone et anglophone en même temps.

Et puis il y a les réseaux communautaires. Montréal a des communautés d'immigrants bien établies — libanaise, haïtienne, italienne, chinoise, maghrébine, latino-américaine — qui servent de filets de soutien pour les nouveaux arrivants. Quand vous ouvrez un commerce dans un quartier où votre communauté est présente, vous avez déjà une clientèle de base et des gens prêts à vous aider.

## Les défis qu'on ne montre pas

L'image de l'entrepreneur immigrant qui réussit est inspirante, mais elle cache aussi des réalités plus dures. L'accès au crédit est difficile quand vous n'avez pas d'historique financier canadien. Les diplômes étrangers ne sont souvent pas reconnus, ce qui pousse des ingénieurs et des médecins vers l'entrepreneuriat par défaut plutôt que par choix. La barrière linguistique, même dans une ville bilingue, reste un obstacle réel.

Et le programme de Visa Startup du Canada, qui permettait aux entrepreneurs étrangers d'immigrer avec un projet d'entreprise, a cessé d'accepter de nouvelles demandes le 31 décembre 2025. La transition vers un nouveau programme ciblé est en cours, mais elle crée de l'incertitude pour ceux qui planifiaient de venir.

## Ce qu'on peut apprendre

La prochaine fois que vous mangez dans un restaurant montréalais, regardez autour de vous. La personne en cuisine, celle qui vous sert, celle qui a conçu le menu — il y a de bonnes chances que plusieurs d'entre elles soient arrivées ici d'un autre pays, avec un rêve et beaucoup de courage.

Montréal n'est pas parfaite. Mais elle a quelque chose que beaucoup de villes n'ont pas : la capacité de transformer la diversité en créativité, et la créativité en communauté. Et ça, c'est en grande partie grâce aux entrepreneurs immigrants qui prennent le risque de recommencer leur vie ici, et qui enrichissent la nôtre en le faisant.`,
      categoryId: catSociete.id,
      authorId: author3.id,
      published: true,
      publishedAt: new Date("2026-03-12"),
      views: 6800,
    },

    // ─── AILLEURS ────────────────────────────────────────────────────
    {
      title: "Ces Montréalais qui ont tout quitté pour vivre à l'étranger",
      slug: "montrealais-expatries-vie-etranger",
      excerpt: "Lisbonne, Oaxaca, Tokyo — ils sont partis, et ils nous racontent leur nouvelle vie sans filtre.",
      imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
      content: `Ils sont partis pour six mois et ne sont jamais revenus. Quatre Montréalais racontent leur expatriation, sans filtres.

## Sofia, 31 ans — Lisbonne, Portugal

« J'ai quitté Montréal après la crise du logement de 2023. Mon loyer avait doublé en deux ans. À Lisbonne, j'ai trouvé un appartement deux fois plus grand pour la moitié du prix. Le soleil, la bouffe, le rythme de vie — tout est mieux ici. Sauf la poutine. La poutine me manque. »

## Marc-Antoine, 28 ans — Oaxaca, Mexique

« Je suis développeur web. Je travaille à distance. Oaxaca, c'est la nourriture, la culture, le coût de la vie. Et le soleil, évidemment. Mon appartement avec terrasse me coûte 600 $ par mois. À Montréal, c'est le prix d'un stationnement. »

## Jade, 35 ans — Tokyo, Japon

« J'avais toujours voulu vivre au Japon. Le système de santé, la sécurité, les transports — tout fonctionne. Mais les hivers de Montréal me manquent, c'est bizarre à dire. Et le bagel St-Viateur, évidemment. »

## Thomas, 40 ans — Berlin, Allemagne

« Berlin, c'est Montréal en plus grand et en plus weird. La scène musicale est folle, les loyers sont (encore) raisonnables et personne ne te juge. Je me sens chez moi ici, comme je me sentais chez moi là-bas. »

## Ce qui les relie

Ce qui est frappant dans ces témoignages, c'est que peu importe où ils sont, ces Montréalais continuent de se définir par rapport à leur ville d'origine. Ils comparent tout — la bouffe, les gens, le rythme de vie — avec Montréal. Et ils gardent tous un lien avec la ville, que ce soit un abonnement au Devoir qu'ils lisent le matin avec leur café à l'étranger, des groupes WhatsApp d'expatriés qui partagent des nouvelles de la maison, ou des billets d'avion réservés pour le temps des Fêtes.

Montréal n'est pas une ville qu'on quitte vraiment. On s'en éloigne, parfois longtemps, mais elle reste dans un coin de la tête. Et souvent, dans un coin du cœur aussi.`,
      categoryId: catAilleurs.id,
      authorId: admin.id,
      published: true,
      publishedAt: new Date("2026-03-17"),
      views: 9200,
    },
    {
      title: "Québec vs reste du monde : les différences culturelles qui surprennent les étrangers",
      slug: "quebec-vs-monde-differences-culturelles-surprennent",
      excerpt: "Du tutoiement automatique aux rénovations obsessionnelles, voici ce qui étonne les nouveaux arrivants au Québec.",
      imageUrl: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&q=80",
      content: `Le Québec est unique en Amérique du Nord. Et certaines de ses particularités culturelles laissent les nouveaux arrivants perplexes — ou enchantés.

## Le tutoiement universel

Au Québec, on tutoie tout le monde : son patron, son médecin, le premier ministre. Pour un Français, c'est libérateur. Pour un Japonais, c'est un choc culturel total.

## Les rénovations comme sport national

Les Québécois passent leurs week-ends au Rona ou au Home Depot. Rénover sa maison est un hobby, une passion, presque une obligation sociale.

## Le déménagement du 1er juillet

Nulle part ailleurs au monde, une société entière ne déménage le même jour. Le 1er juillet, les rues de Montréal se transforment en chaos logistique.

## La météo comme sujet de conversation principal

Il fait -30°C ? On en parle. Il fait 30°C ? On en parle aussi. La météo est le liant social du Québec.

## Le rapport décomplexé à la nourriture

Poutine à 2h du matin, cabane à sucre au printemps, hot-dogs steamés — les Québécois mangent ce qu'ils veulent, quand ils veulent, sans culpabilité.

## La gentillesse qui déstabilise

Les étrangers sont souvent surpris par la gentillesse des Québécois. « Au début, je pensais qu'ils voulaient quelque chose, raconte Ahmed, arrivé d'Algérie en 2021. Puis j'ai compris que c'est juste comme ça ici. »

## Le rapport au froid comme identité

Il y a un dernier truc que les étrangers mettent du temps à comprendre : le froid n'est pas juste un inconvénient au Québec. C'est un élément identitaire. Les Québécois sont fiers de survivre à leurs hivers. Ils en parlent comme d'un badge d'honneur. Quand il fait moins trente, personne ne se plaint — tout le monde se regarde avec un petit sourire qui dit « on est encore là, on tient bon ».

Et si vous voulez vraiment vous intégrer, le secret est simple : la prochaine fois qu'il fait un froid absurde, sortez quand même, commandez une poutine bien chaude, et dites à la personne à côté de vous « il fait frette en tabarnouche ». Vous serez adopté sur le champ.`,
      categoryId: catAilleurs.id,
      authorId: author2.id,
      published: true,
      publishedAt: new Date("2026-03-09"),
      views: 11300,
    },

    // ─── STYLE DE VIE ────────────────────────────────────────────────
    {
      title: "Survivre à l'hiver montréalais : le guide ultime (par des Montréalais)",
      slug: "survivre-hiver-montrealais-guide-ultime",
      excerpt: "Du manteau parfait aux activités qui font oublier le froid, tout ce qu'il faut savoir pour aimer l'hiver au lieu de le subir.",
      imageUrl: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1200&q=80",
      content: `Il y a un moment, quelque part vers la mi-janvier, où la plupart des gens qui viennent de s'installer à Montréal se demandent ce qu'ils sont venus faire ici. Le soleil se couche à 16h30. Il fait moins vingt depuis une semaine. Le vent sur Sainte-Catherine vous brûle le visage. Et vous voyez un gars en combinaison de ski fluo danser dehors sur de la techno au bord du fleuve, une bière à la main, à onze heures du soir, et il a l'air d'être la personne la plus heureuse au monde.

Bienvenue à l'hiver montréalais. C'est absurde, c'est brutal, et c'est — une fois que vous avez compris le truc — absolument magnifique.

## La mentalité avant l'équipement

Je vais commencer par le conseil le plus important, et ce n'est pas un conseil sur les manteaux ou les bottes. C'est un conseil sur l'attitude. Les Montréalais qui aiment l'hiver ne sont pas des surhumains. Ce sont des gens qui ont décidé, consciemment, de ne pas subir la saison. Au lieu de rester chez eux cinq mois en comptant les jours, ils sortent. Ils font des choses. Ils transforment le froid en excuse pour vivre autrement.

C'est la différence fondamentale entre quelqu'un qui déteste l'hiver et quelqu'un qui l'aime : le premier attend que ça passe, le second en profite. Et Montréal est construite pour vous aider à en profiter, si vous le décidez.

## Igloofest : danser à moins vingt

C'est l'événement qui résume le mieux la folie hivernale montréalaise. Igloofest, c'est un festival de musique électronique en plein air, au Quai Jacques-Cartier, en plein mois de janvier et février. L'édition 2026 se tient du 15 janvier au 7 février, et cette année le festival s'étend aussi à Gatineau et Québec.

Le concept est simple : vous enfilez votre combinaison de ski la plus ridicule (il y a un concours du costume le plus laid, le Tackiest Snowsuit Contest), vous rejoignez quelques milliers de personnes sur un plancher de danse gelé, et vous dansez jusqu'à ce que vous ne sentiez plus vos orteils. Il y a un Igloovillage avec des bars, de la bouffe, et des installations lumineuses. Et la musique est sérieuse — l'édition 2026 accueille Lost Frequencies, entre autres.

<iframe width="560" height="315" src="https://www.youtube.com/embed/Pyo0XYR7DEA" title="Igloofest 2026 kicks off on a perfect winter night" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

C'est bizarre sur papier. À vivre, c'est transcendant. Il y a quelque chose dans le fait de danser dehors par moins quinze, entouré de gens aussi fous que vous, avec les lumières de la ville derrière et le fleuve gelé devant, qui vous change. Après Igloofest, l'hiver ne fait plus peur. Il fait sourire.

## Montréal en Lumière : la fête qui réchauffe

Si Igloofest est le côté rave de l'hiver, Montréal en Lumière est le côté raffiné. C'est le plus grand festival hivernal de la ville, habituellement fin février début mars, avec un programme qui mêle gastronomie, arts et activités extérieures.

Les dîners thématiques réunissent des chefs montréalais et internationaux. Le Quartier des spectacles s'illumine d'installations artistiques. Il y a des glissades géantes, une grande roue, des projections lumineuses sur les bâtiments. Et la Nuit Blanche — une soirée où tout est ouvert toute la nuit, gratuitement — est l'un des événements les plus populaires de l'année.

## Le Grand Marché de Noël et LUMINO

L'hiver montréalais commence en douceur avec le Grand Marché de Noël, qui s'installe sur la Place des Festivals de fin novembre à début janvier. Une quarantaine d'artisans locaux, du vin chaud, des sapins illuminés, et cette ambiance de village européen qui donne envie de croire au père Noël même à quarante ans.

Et puis il y a LUMINO, les installations d'art lumineux qui transforment le Quartier des spectacles de novembre à mars. Ce sont des œuvres interactives — des balançoires qui font de la musique, des structures qui changent de couleur quand vous vous approchez — et elles donnent une raison de marcher dehors même quand il fait noir à cinq heures.

## Les activités du quotidien

Au-delà des festivals, l'hiver montréalais se vit aussi dans les petites choses. Le patinage sur le lac des Castors, au sommet du Mont-Royal, avec vue sur la ville illuminée — c'est magique, il n'y a pas d'autre mot. Le ski de fond dans les parcs-nature de l'île, gratuit et accessible. Les randonnées en raquettes dans le Bois-de-Liesse ou au Cap-Saint-Jacques, à vingt minutes du centre-ville, où vous oubliez que vous êtes dans une métropole de deux millions de personnes.

Il y a aussi les spas nordiques. Le Bota Bota, installé sur un bateau dans le Vieux-Port, offre l'expérience chaud-froid-repos avec vue sur le fleuve gelé. Le Scandinave, dans le Vieux-Montréal, est plus intime et plus zen. Le principe est le même : vous alternez entre bain chaud, bain froid, et repos dans une couverture. Après trente minutes de ce cycle, vous comprenez pourquoi les Scandinaves sont les gens les plus heureux du monde.

## Mars : le mois de vérité

Je ne vais pas vous mentir. Le mois le plus difficile, ce n'est pas janvier — en janvier, l'hiver est encore nouveau, encore excitant, et les festivals battent leur plein. Le mois difficile, c'est mars. En mars, l'hiver n'en finit plus. La neige blanche est devenue de la slush brune. Les rues sont sales. Le manteau commence à peser. Et vous savez que dans d'autres villes, les gens portent des t-shirts.

C'est normal de trouver mars pénible. Tout le monde le trouve pénible. Le truc, c'est de tenir bon, parce que quand le printemps arrive — vers la mi-avril, parfois fin avril — l'énergie de la ville explose. Les terrasses ouvrent, les gens sourient, le Mont-Royal redevient vert en une semaine. Et vous comprenez que sans les cinq mois d'hiver, ce printemps ne serait pas aussi intense, aussi euphorique, aussi vivant.

L'hiver à Montréal, c'est le prix à payer pour le plus beau printemps du continent. Et honnêtement, une fois que vous avez dansé à Igloofest, patiné sous les étoiles, et pris un spa nordique avec de la neige dans les cheveux, vous réalisez que le prix n'est pas si élevé que ça.`,
      categoryId: catStyle.id,
      authorId: admin.id,
      published: true,
      publishedAt: new Date("2026-03-16"),
      views: 14100,
    },
    {
      title: "Télétravail à Montréal : les meilleurs cafés et espaces de coworking",
      slug: "teletravail-montreal-meilleurs-cafes-coworking",
      excerpt: "WiFi rapide, bon café et ambiance productive — notre sélection des meilleurs spots pour travailler à distance à Montréal.",
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
      content: `J'ai passé deux ans à travailler de mon salon. Deux ans à fixer les mêmes murs, assis à la même table, avec le même chat qui marchait sur mon clavier pendant les appels Zoom. Et puis un matin de novembre, après un énième meeting où j'ai réalisé que je n'avais pas parlé à un être humain en personne depuis trois jours, je me suis levé, j'ai mis mon laptop dans un sac, et je suis allé travailler dans un café.

Ce jour-là a changé ma vie professionnelle. Pas parce que j'ai été plus productif (même si c'est le cas). Mais parce que j'ai redécouvert quelque chose de fondamental : travailler, c'est mieux quand il y a des gens autour. Et Montréal est peut-être la meilleure ville en Amérique du Nord pour travailler à distance, parce que la ville entière est un bureau.

## La culture café-bureau

Ce qui rend Montréal unique pour le télétravail, c'est que la culture du café ici est naturellement compatible avec le travail. Contrairement à certaines villes où les cafés mettent des panneaux « pas de laptops après 11h » ou où les baristas vous lancent des regards après votre deuxième heure, à Montréal, travailler dans un café est non seulement accepté, mais encouragé.

La plupart des cafés indépendants offrent le wifi gratuit, des prises de courant partout, et ne vous mettent aucune pression sur la durée. C'est un pacte social implicite : vous commandez un café toutes les deux heures, vous ne monopolisez pas la seule table à quatre places quand vous êtes seul, et en échange, le café vous offre un espace de travail avec une ambiance que votre salon ne pourra jamais reproduire.

## Les cafés où travailler

**Crew Collective & Café** — Je l'ai gardé pour le premier parce que c'est, objectivement, l'espace de travail le plus impressionnant de la ville. Installé dans l'ancien siège de la Banque Royale du Canada — un bâtiment néoclassique des années 1920 — Crew Collective a des plafonds de quinze mètres, des colonnes de marbre, des lustres dorés, et un wifi à 200 Mbps. Forbes l'a nommé parmi les plus beaux espaces de coworking au monde. C'est le genre d'endroit où vous prenez un appel Zoom et votre client demande « tu travailles dans un palais ? ». Le café est excellent (grains de Saint-Henri), et l'ambiance est à mi-chemin entre une bibliothèque universitaire et un grand hôtel.

<iframe width="560" height="315" src="https://www.youtube.com/embed/oWGpPFPi-TI" title="Crew Collective & Café Montreal - Tour" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

**Tommy** — Dans la Petite-Patrie, Tommy est le café des gens qui travaillent sérieusement. C'est grand, lumineux, avec de longues tables partagées et des coins plus isolés. L'espresso est impeccable, la musique d'ambiance est bien dosée, et il y a cette énergie silencieuse de concentration qui rend tout le monde productif. C'est mon café de travail par défaut quand j'ai besoin de me concentrer sur un gros projet.

**Café Pista** — Le secret de Villeray. Un petit café avec des prises de courant à chaque place, un wifi solide, et une ambiance de quartier. C'est le genre d'endroit où vous croisez les mêmes freelances chaque semaine, et où les baristas connaissent votre commande par cœur. Moins spectaculaire que Crew, mais plus chaleureux et plus quotidien.

## Les espaces de coworking

Si vous travaillez à distance à plein temps, un café ne suffit pas toujours. Vous avez besoin d'une adresse, d'une salle de réunion, d'un endroit où vous pouvez passer un appel sans chuchoter.

**Fabrik8** — C'est le coworking le plus complet de Montréal. En plus des espaces de travail classiques, il y a un gym, un café, un lounge, une terrasse sur le toit, et — c'est difficile à croire — une patinoire en hiver et un terrain de basketball en été. L'idée est de créer un lieu de vie complet, pas juste un bureau partagé. C'est un investissement (les prix varient selon la formule), mais pour ceux qui veulent un vrai écosystème de travail, c'est imbattable.

**Maison Notman House** — Un manoir en pierre du XIXe siècle sur la rue Sherbrooke, transformé en incubateur tech et espace de coworking. C'est ici que plusieurs startups montréalaises ont fait leurs premiers pas. L'ambiance est plus tech, plus startup, avec des événements de réseautage réguliers et une communauté de fondateurs qui s'entraident. Si vous lancez un projet, c'est l'endroit où être.

**Walter Co-Working** — Dans le Vieux-Port, Walter offre un coworking plus haut de gamme. Des salles de bien-être, des cabines téléphoniques privées, un design soigné. C'est pour ceux qui veulent un environnement de travail premium sans les contraintes d'un bureau traditionnel.

## Le rythme du télétravailleur montréalais

Après deux ans de télétravail à Montréal, j'ai développé une routine que beaucoup de gens partagent. Le matin, je travaille de chez moi — les premières heures sont les plus productives, et je n'ai pas besoin d'être entouré de gens pour écrire des emails ou coder. Vers 10h30, je prends mon laptop et je vais dans un café du quartier. Je commande un espresso, je travaille sur les tâches qui demandent de la concentration, et je déjeune sur place ou dans un resto voisin. L'après-midi, si j'ai des réunions, je rentre chez moi ou je vais dans un espace de coworking qui a des salles fermées.

Ce rythme hybride — maison, café, coworking — est devenu la norme pour beaucoup de Montréalais qui travaillent à distance. La ville s'y prête parfaitement parce que les quartiers sont marchables, les cafés sont partout, et la culture est flexible.

## Le secret que personne ne dit

Le vrai avantage du télétravail à Montréal, ce n'est pas le wifi ou les cafés. C'est la ville elle-même. Quand vous travaillez de chez vous à Montréal, votre pause déjeuner peut être une marche sur le Mont-Royal. Votre pause café peut être un détour par le marché Jean-Talon. Votre fin de journée peut être une bière sur une terrasse du Plateau, en été, à regarder le soleil se coucher sur les escaliers en colimaçon.

Le télétravail est meilleur quand la ville autour de vous est bonne. Et Montréal est très, très bonne.`,
      categoryId: catStyle.id,
      authorId: author2.id,
      published: true,
      publishedAt: new Date("2026-03-11"),
      views: 7600,
    },
    {
      title: "Déménager à Montréal : tout ce qu'il faut savoir avant d'arriver",
      slug: "demenager-montreal-tout-savoir-avant-arriver",
      excerpt: "Quartiers, budget, hiver, démarches administratives et chocs culturels — le vrai guide pour ceux qui veulent s'installer à Montréal sans mauvaises surprises.",
      imageUrl: "https://images.unsplash.com/photo-1519178614-68673b201f36?w=1200&q=80",
      imageCredit: "Photo par Matthias Mullie sur Unsplash",
      content: `J'ai déménagé à Montréal il y a quelques années avec deux valises et une idée assez floue de ce qui m'attendait. Je pensais que le plus dur serait de trouver un appart. En réalité, c'était de comprendre pourquoi tout le monde déménage le même jour, pourquoi les loyers se comptent en « pièces et demie », et pourquoi personne ne m'avait prévenu pour le mois de mars.

Si vous êtes en train de planifier votre installation à Montréal, voici ce que j'aurais aimé qu'on me dise avant de partir.

## Choisir son quartier : la vraie question

Montréal n'est pas une ville uniforme. Chaque quartier a sa propre personnalité, et le choix de l'arrondissement va influencer votre quotidien bien plus que vous ne le pensez.

**Le Plateau-Mont-Royal** reste le quartier emblématique de la vie montréalaise : ruelles colorées, cafés indépendants, vie de quartier intense. Mais les loyers y ont grimpé sérieusement ces dernières années. En 2026, un 4½ (deux chambres) dans le Plateau tourne autour de 1 600 à 2 000 $ par mois, et la compétition pour les bons logements est féroce.

**Rosemont–La Petite-Patrie** attire de plus en plus de jeunes professionnels et de familles. C'est un peu le Plateau d'il y a dix ans : vie de quartier authentique, marché Jean-Talon à proximité, et des loyers encore un cran en dessous. Le métro Beaubien ou Rosemont vous met au centre-ville en quinze minutes.

**Verdun** a connu une transformation remarquable. Ancien quartier ouvrier, il est devenu l'un des secteurs les plus prisés grâce à sa proximité avec le fleuve, sa rue Wellington pleine de restos et de boutiques, et ses loyers qui restent plus accessibles que sur le Plateau. C'est aussi l'un des rares endroits où vous pouvez marcher jusqu'à une plage urbaine l'été.

**Côte-des-Neiges** est le quartier le plus multiculturel de Montréal, et probablement l'un des plus abordables pour sa localisation. Proche de l'Université de Montréal et de l'Oratoire Saint-Joseph, c'est un secteur pratique mais qui manque parfois de charme architectural.

**Pour les familles**, Ahuntsic-Cartierville et Notre-Dame-de-Grâce (NDG) offrent des écoles réputées, de grands parcs, et une ambiance résidentielle calme. Le compromis : c'est un peu plus loin du centre et la vie nocturne est… disons paisible.

Un conseil : avant de signer un bail, passez une journée complète dans le quartier. Prenez un café, faites l'épicerie, marchez les rues le soir. Montréal se vit à pied, et l'ambiance change énormément d'un coin de rue à l'autre.

## Le budget : les vrais chiffres de 2026

On va être direct. Montréal reste plus abordable que Toronto ou Vancouver, mais ce n'est plus la ville « pas chère » qu'elle était. Voici à quoi vous attendre :

**Logement** — C'est votre plus grosse dépense. Un 3½ (une chambre) coûte entre 1 100 et 1 500 $ par mois selon le quartier. Un 4½ (deux chambres), entre 1 400 et 2 100 $. Les logements neufs ou rénovés sont nettement plus chers. Et attention : à Montréal, les loyers se comptent en « pièces et demie ». Le demi, c'est la salle de bain. Donc un 3½, c'est un salon, une chambre et une salle de bain. Pas trois chambres et demie.

**Transport** — La passe mensuelle STM (bus + métro) coûte 97 $ par mois. Le réseau couvre bien l'île, surtout le long des lignes de métro. Beaucoup de Montréalais se déplacent aussi à vélo grâce au réseau BIXI (abonnement annuel autour de 99 $). L'hiver, les pistes cyclables principales restent déneigées — oui, il y a des gens qui pédalent à -20°C.

**Épicerie** — Comptez 350 à 500 $ par mois par personne. Les supermarchés comme Maxi et Super C sont les moins chers. Les marchés publics (Jean-Talon, Atwater) sont magnifiques mais pas toujours économiques. Un truc de local : les épiceries asiatiques et moyen-orientales de Côte-des-Neiges ou Parc-Extension offrent souvent les meilleurs prix pour les fruits, légumes et épices.

**Téléphone et Internet** — Le Canada est notoirement cher pour les télécoms. Prévoyez 50 à 80 $ par mois pour un forfait mobile et 60 à 90 $ pour Internet. Les opérateurs comme Fizz ou Vidéotron offrent souvent des promotions pour les nouveaux clients.

En tout, une personne seule devrait prévoir entre 2 200 et 3 000 $ par mois pour vivre confortablement à Montréal, selon le quartier et le style de vie.

## Le 1er juillet : le jour le plus fou de l'année

Il y a une tradition montréalaise que vous ne trouverez nulle part ailleurs au monde. Le 1er juillet — oui, la fête du Canada — est aussi le jour officiel du déménagement au Québec. La majorité des baux résidentiels se terminent le 30 juin, ce qui signifie que des dizaines de milliers de ménages déménagent en même temps le lendemain.

Le résultat ? Des rues encombrées de camions, des meubles abandonnés sur les trottoirs (c'est d'ailleurs un excellent moment pour trouver du mobilier gratuit), et un chaos organisé qui fait sourire les locaux et paniquer les nouveaux arrivants.

Si vous avez le choix, essayez de signer un bail qui commence à un autre moment de l'année. Et si vous n'avez pas le choix, réservez votre camion de déménagement le plus tôt possible — genre en février. Le 1er juillet, les déménageurs sont les rois de Montréal.

## Survivre à l'hiver (et l'aimer, éventuellement)

Parlons de l'éléphant dans la pièce. L'hiver montréalais dure grosso modo de novembre à avril, avec des températures qui descendent régulièrement à -20°C, parfois -30°C avec le facteur vent. En janvier et février, le soleil se couche vers 16h30.

Ça fait peur sur papier, mais voici la vérité : l'hiver à Montréal est gérable, et même agréable, si vous êtes bien préparé.

**L'équipement essentiel** : un manteau d'hiver de qualité (Canada Goose n'est pas obligatoire — Quartz Co., Kanuk ou même un bon manteau de chez Décathlon font le travail), des bottes imperméables et isolées, des couches de base en laine mérinos, et une tuque. Budget minimum : 400 à 600 $ pour un bon kit.

**Le secret** : les Montréalais ne subissent pas l'hiver, ils l'utilisent. Patinoire sur le lac des Castors, ski de fond au parc du Mont-Royal, festivals d'hiver comme Igloofest (party électro en plein air en janvier — oui, vraiment). La ville souterraine (le RÉSO) connecte aussi des dizaines de stations de métro et de bâtiments commerciaux, ce qui permet de faire pas mal de choses sans mettre le nez dehors.

Le vrai mois difficile, c'est mars. L'hiver n'en finit plus, la slush brune envahit les rues, et tout le monde est un peu à bout. Mais quand le printemps arrive enfin, vers la mi-avril, l'énergie de la ville explose littéralement.

## Les démarches administratives : la checklist

Si vous arrivez de l'étranger, voici les étapes essentielles dans l'ordre :

**Avant le départ** — Demandez votre permis de travail ou d'études (si applicable), votre NAS (numéro d'assurance sociale) dès que possible, et ouvrez un compte bancaire canadien. Desjardins et la Banque Nationale sont populaires au Québec et offrent souvent des forfaits pour les nouveaux arrivants.

**Les premières semaines** — Inscrivez-vous à la RAMQ (Régie de l'assurance maladie du Québec) pour votre carte d'assurance maladie. Attention : il y a souvent un délai de carence de trois mois avant que la couverture soit active, donc prévoyez une assurance privée temporaire. Obtenez votre permis de conduire québécois si vous en avez besoin (certaines ententes permettent l'échange direct selon votre pays d'origine).

**Le français** — Le Québec offre des cours de français gratuits (programme de francisation) pour les immigrants permanents. Même si vous parlez déjà français, le québécois a ses propres expressions et son propre rythme. « C'est correct » veut dire que tout va bien. « Je suis tanné » veut dire que vous en avez assez. Et si quelqu'un vous dit « on se parle », ça veut dire au revoir, pas qu'il veut avoir une conversation.

## Ce que personne ne vous dit

Les Montréalais ont l'air fermés dans le métro, mais invitez-les à prendre une bière et vous découvrirez des gens chaleureux et drôles. La culture des « 5 à 7 » (les afterworks) est un excellent moyen de socialiser.

La scène culinaire est exceptionnelle et sous-estimée. Montréal rivalise avec des villes deux fois plus grandes grâce à ses restos BYOB (apportez votre vin), sa cuisine de rue, et ses brunchs du dimanche qui sont pratiquement une religion locale.

La ville est faite pour être vécue dehors. En été, il y a un festival pratiquement chaque semaine : Jazz, Juste pour rire, Osheaga, les Francos, Nuits d'Afrique. La plupart ont des activités gratuites.

Et un dernier conseil : les premières semaines seront un mélange d'excitation et de moments de doute. C'est normal. Montréal est une ville qui se mérite un peu. Mais une fois que vous aurez trouvé votre café préféré, votre dépanneur de coin, et vos premières amitiés montréalaises, vous comprendrez pourquoi les gens qui arrivent ici finissent rarement par repartir.

Bienvenue chez vous.`,
      categoryId: catStyle.id,
      authorId: admin.id,
      published: true,
      publishedAt: new Date("2026-03-03"),
      views: 16800,
    },
  ];

  let articlesCreated = 0;
  for (const article of articles) {
    await db.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        imageUrl: article.imageUrl,
        imageCredit: article.imageCredit ?? null,
        views: article.views,
      },
      create: article,
    });
    articlesCreated++;
  }
  console.log(`✓ ${articlesCreated} articles créés`);

  // ── Commentaires ───────────────────────────────────────────────────
  const commentArticles = [
    "plateau-mont-royal-2026-gentrification-resistance",
    "10-meilleures-poutines-montreal-guide-definitif",
    "festival-jazz-montreal-2026-programmation-complete",
    "crise-logement-montreal-solutions-qui-marchent",
    "survivre-hiver-montrealais-guide-ultime",
  ];

  const commentTexts = [
    "Excellent article. J'habite le Plateau depuis 15 ans et je vois exactement ce dont vous parlez.",
    "La Banquise en #1 ? Enfin quelqu'un de sensé ! Mais vous avez oublié Frite Alors sur Parc.",
    "J'ai déjà mes billets pour Kamasi Washington ! Vivement juillet.",
    "Les coops c'est super en théorie, mais essayez d'en joindre une — les listes d'attente sont de 5 ans minimum.",
    "Ajoutez les bains flottants sur votre liste ! Ovarium sur le boulevard Saint-Laurent, c'est incroyable en hiver.",
    "Le REM a changé ma vie. Je fais Brossard-Centre-Ville en 15 minutes maintenant.",
    "La poutine de Ma Poule Mouillée est surcotée. Change my mind.",
    "Merci pour ce guide ! Je déménage à Montréal en septembre, ça m'aide beaucoup.",
  ];

  let commentsCreated = 0;
  for (let i = 0; i < commentTexts.length; i++) {
    const articleSlug = commentArticles[i % commentArticles.length];
    const article = await db.article.findUnique({ where: { slug: articleSlug } });
    if (article) {
      const commentId = `seed-comment-${i + 1}`;
      await db.comment.upsert({
        where: { id: commentId },
        update: {},
        create: {
          id: commentId,
          content: commentTexts[i],
          userId: user.id,
          articleId: article.id,
        },
      });
      commentsCreated++;
    }
  }
  console.log(`✓ ${commentsCreated} commentaires créés`);

  console.log("\n✅ Seed terminé !");
  console.log(`\n📊 Résumé :`);
  console.log(`   ${categories.length} catégories`);
  console.log(`   ${articlesCreated} articles avec images`);
  console.log(`   ${commentsCreated} commentaires`);
  console.log(`   4 utilisateurs`);
  console.log("\n🔑 Comptes de test :");
  console.log("   Admin  → admin@montrealuncovered.com / admin1234");
  console.log("   Admin  → sofia@montrealuncovered.com / admin1234");
  console.log("   Admin  → marc@montrealuncovered.com / admin1234");
  console.log("   Lecteur → lecteur@example.com / user1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
