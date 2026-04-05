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
      content: `Le Plateau-Mont-Royal est l'un des quartiers les plus photographiés, les plus écrits, les plus débattus de Montréal. Et pourtant, en 2026, il continue de surprendre.

Depuis dix ans, le prix médian des logements a augmenté de 78 %. Les vieux dépanneurs ont laissé place à des cafés à douze dollars la tasse. Mais dans les ruelles, dans les sous-sols, dans les studios où s'entassent les artistes, quelque chose résiste.

## Une résistance qui s'organise

Le Comité de défense des locataires du Plateau est actif depuis 2019. Chaque semaine, des réunions se tiennent dans les arrière-salles de bars que la gentrification n'a pas encore avalés.

« On ne se bat pas contre le changement, dit Marie-Lune Desrochers, coordinatrice du comité. On se bat pour que les gens qui ont construit ce quartier puissent encore y vivre. »

## Ce que disent les chiffres

Entre 2021 et 2026, plus de 4 000 locataires ont reçu des avis d'éviction dans l'arrondissement. Le nombre d'OBNL d'habitation a doublé, mais reste insuffisant.

La Ville, pour sa part, a investi 52 millions dans des projets de logement abordable — une goutte dans l'océan, selon les militants. Les loyers moyens pour un 4½ dépassent maintenant les 1 800 $ par mois.

## Le Plateau de demain

Ce qui frappe, c'est la dualité du quartier. D'un côté, des boutiques haut de gamme et des restaurants gastronomiques. De l'autre, des organismes communautaires qui peinent à payer leur loyer. Le Plateau est devenu le miroir des tensions qui traversent toute la ville.`,
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
      content: `Il y a quinze ans, Griffintown était un quartier oublié. Des entrepôts vides, des stationnements à ciel ouvert, quelques usines abandonnées le long du canal de Lachine.

Aujourd'hui, c'est l'un des codes postaux les plus chers de Montréal. Le prix moyen d'un condo dépasse les 650 000 $. Et les grues continuent de pousser.

## La grande transformation

Tout a commencé vers 2012 avec les premiers projets de condos le long du canal. Les promoteurs ont flairé l'opportunité : un quartier central, bien desservi, avec le charme industriel que les acheteurs adorent.

En cinq ans, plus de 8 000 unités de logement ont été construites. Des restaurants branchés ont ouvert. Des bureaux de startups ont pris possession des anciens entrepôts.

## Ce qui manque

Malgré la densité de population, Griffintown manque cruellement de services de proximité. Pas d'école primaire dans le quartier. Un seul parc digne de ce nom. Les familles qui s'y installent découvrent vite que le quartier a été conçu pour des célibataires et des couples sans enfants.

## Les voix critiques

« On a construit un quartier-dortoir de luxe, pas une communauté », résume Hélène Bédard, urbaniste et résidente du secteur. « Il n'y a pas de tissu social ici. Les gens vivent dans leurs condos et ne se connaissent pas. »`,
      categoryId: catLocal.id,
      authorId: author2.id,
      published: true,
      publishedAt: new Date("2026-03-26"),
      views: 11800,
    },
    {
      title: "Les 12 meilleurs marchés publics de Montréal pour le printemps 2026",
      slug: "meilleurs-marches-publics-montreal-printemps-2026",
      excerpt: "Des produits locaux, des rencontres authentiques et l'ambiance unique des marchés montréalais. Notre guide complet pour la saison.",
      imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80",
      content: `Le printemps à Montréal, c'est le retour des marchés publics. Et cette année, la scène est plus riche que jamais avec de nouveaux marchés qui s'ajoutent aux classiques.

## Les incontournables

**1. Marché Jean-Talon** — Le plus célèbre. Ouvert à l'année, il explose de couleurs dès avril. Ne manquez pas les premières asperges du Québec et les plants de tomates.

**2. Marché Atwater** — Plus intime, plus gastronomique. La fromagerie, la boucherie et les étals de fleurs valent le détour.

**3. Marché Maisonneuve** — Le joyau caché de l'est. Moins touristique, plus abordable, avec une offre locale exceptionnelle.

## Les nouveaux marchés à découvrir

**4. Marché Verdun** — Inauguré en 2025 sur la promenade Wellington. Ambiance de village avec vue sur le fleuve.

**5. Marché du Mile-End** — Chaque samedi matin sur la rue Bernard. Producteurs bio et artisans locaux.

**6. Marché Saint-Henri** — Dans la cour de l'ancienne usine. Atmosphère industrielle et produits fermiers.

## Conseils pratiques

Arrivez tôt le samedi matin pour les meilleurs choix. Apportez vos sacs réutilisables — la plupart des marchés n'offrent plus de sacs plastique. Et n'hésitez pas à goûter : les producteurs adorent partager.`,
      categoryId: catLocal.id,
      authorId: author3.id,
      published: true,
      publishedAt: new Date("2026-03-24"),
      views: 9400,
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

La Ville a annoncé un investissement de 200 millions pour moderniser le réseau d'ici 2030. Au programme : meilleure signalisation, espaces verts intérieurs et connexion avec les nouvelles stations du REM.`,
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

Les ruelles vertes réduisent les îlots de chaleur de 2 à 4°C en été. Elles absorbent l'eau de pluie et créent des corridors de biodiversité. Plus important encore : elles recréent du lien social dans des quartiers où les voisins ne se parlaient plus.`,
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
      content: `Le Festival International de Jazz de Montréal revient du 25 juin au 5 juillet 2026. Et cette année, la programmation promet d'être historique.

## Les têtes d'affiche

- **Robert Glasper** — Salle Wilfrid-Pelletier, 28 juin
- **Arooj Aftab** — Monument-National, 30 juin
- **Kamasi Washington** — Place des Arts, 2 juillet
- **Cécile McLorin Salvant** — Théâtre Maisonneuve, 4 juillet

## La scène locale qui brille

Le festival met cette année l'accent sur la relève montréalaise. La pianiste Gentiane MG, le saxophoniste Hichem Khalfa et le collectif Nomad'Stones auront chacun leur soirée dédiée.

## Les incontournables gratuits

Chaque soir de 20h à minuit, le Quartier des spectacles se transforme en scène géante. Notre coup de cœur : les jam sessions spontanées sur la place des Festivals, où musiciens professionnels et amateurs se mélangent.

## Nos conseils

- Réservez vos billets dès maintenant pour les concerts en salle — les meilleures places partent vite
- Pour les spectacles gratuits, arrivez 30 minutes avant et apportez une couverture
- Le meilleur rapport qualité-prix : les concerts de minuit dans les clubs de la rue Saint-Denis`,
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

## Les quartiers à explorer

- **Boulevard Saint-Laurent** entre Sherbrooke et Mont-Royal : la plus grande concentration
- **Ruelles du Mile-End** : l'art le plus spontané et underground
- **Saint-Henri** : les murales les plus politiques et engagées
- **HoMa (Hochelaga-Maisonneuve)** : la scène émergente

## Le festival MURAL

Du 6 au 16 juin 2026, le festival MURAL invite des artistes du monde entier à créer de nouvelles œuvres sur les murs du boulevard. Entrée libre. Les spectateurs peuvent regarder les artistes travailler en direct.`,
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

Le festival annonce sa plus grande édition. Plus de 1 500 spectacles en juillet, dont 200 en anglais et 50 en espagnol. La scène du Quartier Latin accueillera pour la première fois des humoristes d'Afrique francophone.`,
      categoryId: catCulture.id,
      authorId: author3.id,
      published: true,
      publishedAt: new Date("2026-03-18"),
      views: 7100,
    },
    {
      title: "Les 15 meilleures salles de spectacle cachées de Montréal",
      slug: "15-meilleures-salles-spectacle-cachees-montreal",
      excerpt: "Oubliez le Centre Bell et la Place des Arts. Les meilleures soirées se passent dans ces salles que personne ne connaît.",
      imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80",
      content: `Montréal regorge de petites salles de spectacle où l'ambiance est incomparable. Voici nos favorites.

## Musique

**1. Casa del Popolo** — Boulevard Saint-Laurent. La mecque du rock indépendant montréalais. Capacité : 150 personnes. Ambiance garantie.

**2. Le Ministère** — Rue Sainte-Catherine. Ancien club transformé en salle multigenre. Les soirées jazz du jeudi sont légendaires.

**3. Sala Rossa** — Juste au-dessus de Casa del Popolo. Plus grande, mais toujours aussi intime.

## Théâtre et performance

**4. La Chapelle Scènes Contemporaines** — Mile-End. Théâtre expérimental dans une ancienne chapelle. L'acoustique est parfaite.

**5. Espace Libre** — Centre-Sud. Théâtre de création qui prend des risques. On y a vu les premières pièces de Robert Lepage.

## Humour

**6. Le Bordel Comédie Club** — Plateau. Micro ouvert chaque mardi. Les futurs stars de l'humour passent ici en premier.

**7. Théâtre Sainte-Catherine** — Le plus petit théâtre de la ville. 60 places. Vous êtes à deux mètres des artistes.

## Nos conseils

Consultez les programmations sur les réseaux sociaux plutôt que sur les sites web — ces salles fonctionnent souvent à la dernière minute. Arrivez tôt : quand c'est plein, c'est plein.`,
      categoryId: catCulture.id,
      authorId: admin.id,
      published: true,
      publishedAt: new Date("2026-03-10"),
      views: 5600,
    },

    // ─── GASTRONOMIE ─────────────────────────────────────────────────
    {
      title: "Les 10 meilleures poutines de Montréal : le guide définitif",
      slug: "10-meilleures-poutines-montreal-guide-definitif",
      excerpt: "On a mangé 47 poutines en 30 jours. Nos artères nous détestent, mais voici le classement que vous attendiez.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/La_Banquise_Poutine.jpg/960px-La_Banquise_Poutine.jpg",
      content: `La poutine est l'âme culinaire de Montréal. Mais toutes les poutines ne se valent pas. Après un mois d'investigation intensive (et quelques kilos en plus), voici notre classement définitif.

## Le Top 10

**1. La Banquise** — La légende. Plus de 30 variétés, ouverte 24h/24. La classique reste la meilleure : frites croustillantes, sauce brune parfaite, fromage qui fait « couic ».

**2. Chez Claudette** — Avenue Laurier. La poutine de quartier par excellence. Pas de chichis, pas de menu à 47 pages. Juste la perfection.

**3. Ma Poule Mouillée** — Rachel Est. La poutine au poulet portugais est un chef-d'œuvre. Le mariage improbable qui fonctionne.

**4. Poutineville** — Plusieurs adresses. Le concept « crée ta poutine » avec des dizaines d'ingrédients. Idéal pour les aventuriers.

**5. Au Pied de Cochon** — La poutine au foie gras. Oui, c'est excessif. Oui, c'est cher. Oui, c'est un must au moins une fois dans sa vie.

## Les critères de jugement

- Qualité des frites (croustillantes dehors, moelleuses dedans)
- Fromage en grains frais (le « couic » est non négociable)
- Sauce maison (pas de sauce en poudre)
- Rapport quantité-prix
- L'ambiance du lieu

## Le débat éternel

La sauce brune ou la sauce BBQ ? Les puristes crient au scandale, mais les deux camps ont raison. La vraie poutine accepte toutes les sauces, tant qu'elles sont faites maison.`,
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
      content: `Le brunch du dimanche à Montréal est une institution. La file d'attente fait partie de l'expérience. Mais certaines adresses valent chaque minute passée dans le froid.

## Nos favoris

**1. L'Avenue** — Mont-Royal Est. La référence depuis 20 ans. Les pancakes au beurre d'érable sont obscènes de bonheur. File d'attente : 30-45 min le dimanche.

**2. Régine Café** — Beaubien. Petit, parfait et convivial. Le pain doré à la brioche est une œuvre d'art. Arrive avant 10h ou tu attends une heure.

**3. Le Passé Composé** — Villeray. Cuisine française revisitée pour le brunch. Les œufs bénédictine au saumon fumé local sont exceptionnels.

**4. Chez José** — Duluth. Le brunch le plus généreux de la ville. Tu sors de là incapable de marcher, mais heureux.

**5. Arthur's Nosh Bar** — Le meilleur brunch d'inspiration juive de la ville. Le bagel maison est à mourir.

## Le conseil de pro

Plusieurs restos offrent maintenant la réservation en ligne. Utilisez l'application Yelp Wait ou appelez 30 minutes avant d'arriver. Sinon, visez 9h : la fenêtre entre les lève-tôt et la foule.`,
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
      content: `Oubliez Seattle. Oubliez Portland. La meilleure scène café en Amérique du Nord, c'est Montréal. Et ce n'est pas nous qui le disons — c'est le magazine Sprudge, bible mondiale du café de spécialité.

## Les torréfacteurs à connaître

**Café Saint-Henri** — Les pionniers. Ils torréfient depuis 2011 et leurs grains se retrouvent dans les meilleurs restaurants de la ville.

**Dispatch Coffee** — Le joueur technique. Leur approche scientifique du café donne des résultats extraordinaires.

**Zab Café** — Le petit nouveau qui monte. Torréfaction légère, notes fruitées, c'est du café nouvelle génération.

## Les adresses incontournables

- **Crew Collective** — Dans l'ancienne Banque Royale. Le plus beau café du Canada, sans discussion.
- **Tommy** — Petite-Patrie. L'ambiance parfaite pour travailler ou ne rien faire.
- **Pikolo Espresso Bar** — Le comptoir le plus minuscule avec le meilleur espresso.

## Pourquoi Montréal ?

La combinaison de la culture européenne du café (héritage français), de l'accessibilité des grains verts via le port de Montréal, et d'une scène culinaire exigeante a créé le terreau parfait pour une révolution café.`,
      categoryId: catGastro.id,
      authorId: author3.id,
      published: true,
      publishedAt: new Date("2026-03-14"),
      views: 8200,
    },
    {
      title: "Cuisine de rue à Montréal : les food trucks qui cartonnent en 2026",
      slug: "cuisine-rue-montreal-food-trucks-2026",
      excerpt: "De la cuisine libanaise au BBQ texan en passant par les tacos coréens, les food trucks montréalais repoussent les limites.",
      imageUrl: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1200&q=80",
      content: `La cuisine de rue à Montréal a explosé ces dernières années. Les food trucks ne sont plus de simples casse-croûtes — ce sont des restaurants gastronomiques sur roues.

## Les incontournables

**Grumman '78** — Le pionnier des food trucks montréalais. Tacos au porc effiloché dans un ancien véhicule militaire. Légendaire.

**Le Cheese Truck** — Grilled cheese gourmet avec fromages québécois. Le combo brie-poire-noix est addictif.

**P.A. & Gargantua** — Pizza napolitaine cuite au feu de bois dans un camion. L'attente vaut le coup.

## Les nouveaux

**Kimchi Boy** — Fusion coréenne-québécoise. La poutine au kimchi est une révélation.

**Falafel Saint-Jacques** — Le meilleur falafel de la ville, et il est dans un camion. Ironie totale.

## Où les trouver

Les food trucks se concentrent autour du Vieux-Port en été, sur l'esplanade du Parc olympique et lors des événements spéciaux. Suivez-les sur Instagram — ils changent d'emplacement chaque jour.`,
      categoryId: catGastro.id,
      authorId: admin.id,
      published: true,
      publishedAt: new Date("2026-03-08"),
      views: 5900,
    },

    // ─── SOCIÉTÉ ─────────────────────────────────────────────────────
    {
      title: "Crise du logement à Montréal : les solutions qui marchent (et celles qui ne marchent pas)",
      slug: "crise-logement-montreal-solutions-qui-marchent",
      excerpt: "Colocation, coopératives, tiny houses — portrait des Montréalais qui inventent de nouvelles façons de se loger.",
      imageUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
      content: `Le taux d'inoccupation à Montréal est tombé sous les 2 % en 2026. Le loyer moyen d'un 4½ a atteint 1 650 $. Pour des milliers de Montréalais, trouver un logement décent est devenu un combat quotidien.

## Les solutions qui émergent

### Coopératives d'habitation

Le modèle coopératif connaît un renouveau. Plus de 30 nouveaux projets sont en développement, portés par des groupes de citoyens qui refusent la logique du marché.

« Dans une coop, tu paies un loyer, mais tu es aussi propriétaire collectif, explique André Castonguay, directeur de la FECHIMM. C'est le modèle le plus durable qu'on ait. »

### Colocation professionnelle

Des entreprises comme Outpost et Cohabitat proposent des espaces de colocation clé en main : chambre privée, espaces communs partagés, tout inclus. Le concept attire les 25-35 ans.

### Tiny houses

Plusieurs terrains dans les Laurentides et sur la Rive-Sud accueillent des communautés de tiny houses. Investissement : 60 000 à 90 000 $. La Ville de Montréal étudie la possibilité d'autoriser des tiny houses sur l'île.

## Ce qui ne marche pas

Les mesures d'aide au loyer sont insuffisantes. Le registre des loyers, promis depuis des années, n'est toujours pas en place. Et la construction de logements sociaux avance trop lentement.`,
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
      content: `Le Réseau express métropolitain devait révolutionner les transports à Montréal. Un an après le lancement, le bilan est mitigé.

## Ce qui fonctionne

L'axe vers l'aéroport a transformé la vie des voyageurs fréquents. Le trajet centre-ville–YUL est passé de 45 minutes en taxi à 20 minutes en REM, pour une fraction du prix.

L'achalandage dépasse les prévisions : 85 000 usagers par jour sur la branche Rive-Sud, contre 70 000 estimés.

## Ce qui déçoit

La fréquence en heures creuses reste insuffisante. Attendre 12 minutes un train automatisé, ça frustre. Les stations manquent de chaleur — beaucoup les comparent à des aéroports plutôt qu'à des lieux de vie.

## L'impact sur les quartiers

Les quartiers autour des stations connaissent une flambée immobilière. Le prix des propriétés a grimpé de 15 à 25 % dans un rayon de 500 mètres autour des stations.

## Et les vélos ?

Le réseau cyclable progresse aussi. Montréal a ajouté 50 km de pistes protégées en 2025, et le système BIXI compte maintenant 12 000 vélos dont 2 500 électriques.`,
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
      content: `Montréal doit une grande part de son dynamisme économique et culturel à ses immigrants. Voici cinq histoires qui illustrent cette contribution.

## Amira, 34 ans — De Beyrouth à la rue Saint-Denis

Arrivée en 2019 avec 3 000 $ en poche, Amira a ouvert un restaurant libanais dans le Quartier latin. Trois ans plus tard, « Chez Amira » emploie 15 personnes et a été nommé meilleur nouveau restaurant par le Guide Restos Voir.

## Chen Wei, 29 ans — De Shanghai à la Station F Montréal

Développeur de jeux vidéo, Chen Wei a cofondé un studio de 40 personnes spécialisé en réalité virtuelle. « Montréal a le talent et les coûts sont raisonnables comparés à San Francisco. C'est la ville parfaite pour une startup. »

## Fatou, 41 ans — De Dakar à Verdun

Fatou a lancé une marque de vêtements qui fusionne mode africaine et style montréalais. Sa boutique sur la rue Wellington est devenue un lieu de rencontre pour la communauté.

## L'impact en chiffres

Selon la Chambre de commerce de Montréal, les immigrants représentent 35 % des nouveaux entrepreneurs de la ville. Ils créent en moyenne 2,3 emplois chacun dans les trois premières années.`,
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

« Berlin, c'est Montréal en plus grand et en plus weird. La scène musicale est folle, les loyers sont (encore) raisonnables et personne ne te juge. Je me sens chez moi ici, comme je me sentais chez moi là-bas. »`,
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

Les étrangers sont souvent surpris par la gentillesse des Québécois. « Au début, je pensais qu'ils voulaient quelque chose, raconte Ahmed, arrivé d'Algérie en 2021. Puis j'ai compris que c'est juste comme ça ici. »`,
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
      content: `L'hiver à Montréal dure cinq mois. C'est long. C'est froid. C'est parfois brutal. Mais avec les bonnes stratégies, ça peut devenir la meilleure saison de l'année.

## L'équipement essentiel

**Le manteau** — Investissez dans un vrai manteau d'hiver canadien. Kanuk, Quartz Co., Noize — les marques locales sont les meilleures parce qu'elles sont conçues pour ce climat spécifique.

**Les bottes** — Des Sorel ou des Baffin avec semelles à crampons. Le verglas montréalais est traître.

**Les couches** — Le secret des Montréalais, c'est le système de couches : sous-vêtement thermique, polar, manteau. Vous pouvez affronter -35°C en confort.

## Les activités qui sauvent

- **Patinage sur le lac des Castors** — Mont-Royal, sous les étoiles. Magique.
- **Ski de fond au Parc-nature du Bois-de-Liesse** — Gratuit et à 20 minutes du centre-ville.
- **Igloofest** — Danser en combinaison de ski au Vieux-Port. L'expérience montréalaise par excellence.
- **Spa nordique** — Bota Bota sur le fleuve, Scandinave dans le Vieux. Chaud-froid-chaud, la recette du bonheur.

## L'attitude

Le vrai secret, c'est mental. Les Montréalais qui aiment l'hiver sont ceux qui sortent malgré le froid. Chaque tempête est une aventure. Chaque journée de -25°C est une histoire à raconter.`,
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
      content: `Le télétravail est devenu la norme pour beaucoup de Montréalais. Mais travailler de chez soi tous les jours, c'est déprimant. Voici nos spots préférés pour changer d'air.

## Les cafés wifi-friendly

**1. Crew Collective** — L'ancien siège de la Banque Royale, transformé en café-coworking. Plafonds voûtés, colonnes de marbre, WiFi ultra-rapide. L'endroit le plus impressionnant pour passer un appel Zoom.

**2. Tommy** — Petite-Patrie. Grand, lumineux, calme. Le café est excellent et personne ne te regarde de travers si tu restes 4 heures.

**3. Café Pista** — Villeray. Le spot des freelances du quartier. Prises de courant partout, musique d'ambiance parfaite.

## Les espaces de coworking

**4. WeWork Place Ville-Marie** — Le classique. Vue panoramique sur la ville. À partir de 350 $/mois.

**5. Espace Réunion** — Mile-End. Plus intime, plus créatif. Parfait pour les artistes et les créateurs de contenu.

**6. La Gare** — Un ancien entrepôt ferroviaire transformé en hub de coworking. Les espaces communs sont spectaculaires.

## Nos critères

- WiFi minimum 100 Mbps
- Prises de courant accessibles
- Bon café (non négociable)
- Ambiance qui favorise la concentration
- Possibilité de rester longtemps sans pression`,
      categoryId: catStyle.id,
      authorId: author2.id,
      published: true,
      publishedAt: new Date("2026-03-11"),
      views: 7600,
    },
    {
      title: "Les parcs de Montréal : les 10 plus beaux et pourquoi les visiter",
      slug: "parcs-montreal-10-plus-beaux-pourquoi-visiter",
      excerpt: "Du Mont-Royal au parc Jean-Drapeau, les espaces verts qui font de Montréal une des villes les plus agréables d'Amérique du Nord.",
      imageUrl: "https://images.unsplash.com/photo-1569974498991-d3c12a4a7908?w=1200&q=80",
      content: `Montréal est l'une des villes les plus vertes d'Amérique du Nord. Avec plus de 1 000 parcs et espaces verts, il y a toujours un coin de nature à portée de marche.

## Les incontournables

**1. Parc du Mont-Royal** — Le poumon de la ville. Conçu par Frederick Law Olmsted (le même qui a dessiné Central Park). Le belvédère Kondiaronk offre la plus belle vue sur Montréal.

**2. Parc Jean-Drapeau** — Deux îles au milieu du fleuve. Plage, Biosphère, Circuit Gilles-Villeneuve. Un monde à part.

**3. Parc La Fontaine** — Le parc du Plateau. Étang, fontaines, spectacles gratuits en été. C'est ici que Montréal vient pique-niquer.

## Les secrets bien gardés

**4. Parc-nature du Bois-de-Liesse** — L'Ouest de l'île. 159 hectares de forêt. On oublie qu'on est en ville.

**5. Jardin botanique** — 75 hectares, 22 000 espèces. Le jardin japonais est un chef-d'œuvre de sérénité.

**6. Parc Frédéric-Back** — Saint-Michel. Ancien dépotoir transformé en parc. La plus belle histoire de réhabilitation urbaine de Montréal.

## En toute saison

Les parcs de Montréal sont magnifiques à chaque saison. L'automne au Mont-Royal (les couleurs !), l'hiver au Parc La Fontaine (patinoire), le printemps au Jardin botanique (cerisiers en fleurs), l'été partout.`,
      categoryId: catStyle.id,
      authorId: author3.id,
      published: true,
      publishedAt: new Date("2026-03-06"),
      views: 9500,
    },
    {
      title: "Déménager à Montréal : tout ce qu'il faut savoir avant d'arriver",
      slug: "demenager-montreal-tout-savoir-avant-arriver",
      excerpt: "Quartiers, budget, transport, culture — le guide complet pour ceux qui veulent s'installer dans la métropole québécoise.",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80",
      content: `Vous pensez à déménager à Montréal ? Excellent choix. Mais il y a des choses à savoir avant de faire vos boîtes.

## Quel quartier choisir ?

**Pour les jeunes professionnels** — Le Plateau, Rosemont, Villeray. Vie de quartier, restos, proximité du centre.

**Pour les familles** — Ahuntsic, NDG, Verdun. Écoles, parcs, ambiance tranquille à prix (relativement) abordable.

**Pour les étudiants** — Le Quartier latin, Côte-des-Neiges. Proche des universités, loyers plus bas.

**Pour les artistes** — Mile-End, Saint-Henri, HoMa. Studios abordables (enfin, un peu moins qu'avant), galeries, communauté créative.

## Le budget réaliste

- **Loyer 3½** : 1 100-1 500 $/mois
- **Loyer 4½** : 1 400-1 900 $/mois
- **Épicerie** : 300-500 $/mois par personne
- **Transport (passe STM)** : 97 $/mois
- **Internet** : 60-80 $/mois

## Ce qu'on ne vous dit pas

- Le 1er juillet est la « journée du déménagement ». Si possible, évitez.
- Apprenez le français. Même si Montréal est bilingue, le français vous ouvre des portes.
- L'hiver est long mais il est beau. Investissez dans un bon manteau.
- Les Montréalais sont accueillants mais discrets. Ça prend du temps de se faire des amis, mais une fois que c'est fait, c'est pour la vie.`,
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
      update: { views: article.views, imageUrl: article.imageUrl },
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
