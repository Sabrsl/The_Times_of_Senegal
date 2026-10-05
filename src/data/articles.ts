import { Article } from '@/types'

export const articles: Article[] = [
  {
    id: '1',
    slug: 'nouvelle-politique-agricole-senegal-2026',
    title: 'Le Sénégal lance une nouvelle politique agricole ambitieuse pour 2026',
    excerpt: 'Le gouvernement sénégalais annonce un plan d\'investissement de 500 milliards de FCFA pour moderniser le secteur agricole et renforcer la sécurité alimentaire.',
    content: `
      <p>Le gouvernement du Sénégal a dévoilé ce mercredi une nouvelle politique agricole qui vise à transformer le secteur sur les cinq prochaines années. Avec un budget de 500 milliards de FCFA, ce plan ambitionne de moderniser les techniques de production, d'améliorer l'accès aux marchés et de renforcer la résilience face au changement climatique.</p>
      
      <p>Le Premier ministre a souligné lors de la conférence de presse que cette initiative s'inscrit dans le cadre du Plan Sénégal Émergent (PSE) et répond aux défis majeurs que rencontre le secteur agricole, notamment la faible productivité, la dépendance aux importations et la vulnérabilité aux aléas climatiques.</p>
      
      <h3>Les piliers du nouveau plan</h3>
      
      <p>Le nouveau plan repose sur quatre piliers principaux :</p>
      
      <ul>
        <li><strong>Modernisation des infrastructures</strong> : Construction de nouveaux systèmes d'irrigation et réhabilitation des périmètres existants dans les vallées du Fleuve Sénégal et de la Casamance.</li>
        <li><strong>Appui aux producteurs</strong> : Mise en place d'un fonds de garantie pour faciliter l'accès au crédit des agriculteurs et développement de programmes de formation.</li>
        <li><strong>Développement des filières</strong> : Renforcement des chaînes de valeur pour l'arachide, le riz, le mil et les produits maraîchers.</li>
        <li><strong>Recherche et innovation</strong> : Investissement dans la recherche agronomique et promotion de l'agriculture numérique.</li>
      </ul>
      
      <p>Les experts du secteur accueillent favorablement cette initiative tout en soulignant la nécessité d'une mise en œuvre rigoureuse et d'une coordination effective entre les différents acteurs.</p>
    `,
    category: 'politique',
    author: {
      name: 'Amadou Diallo',
      slug: 'amadou-diallo',
    },
    publishedAt: '2026-10-03T09:42:00',
    updatedAt: '2026-10-03T11:32:00',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=450&fit=crop',
    sources: [
      {
        id: 's1',
        name: 'Gouvernement du Sénégal',
        type: 'government',
        url: 'https://www.gouv.sn',
        description: 'Communiqué officiel du Conseil des ministres',
      },
      {
        id: 's2',
        name: 'ANSD',
        type: 'statistical',
        url: 'https://www.ansd.sn',
        description: 'Données sur le secteur agricole sénégalais',
      },
    ],
    relatedArticles: ['2', '3'],
    entities: [
      { type: 'organization', name: 'Gouvernement du Sénégal', slug: 'gouvernement-du-senegal' },
      { type: 'person', name: 'Premier ministre', slug: 'premier-ministre' },
    ],
  },
  {
    id: '2',
    slug: 'croissance-economique-senegal-t3-2026',
    title: 'La croissance économique du Sénégal atteint 6,8% au troisième trimestre 2026',
    excerpt: 'Selon l\'ANSD, l\'économie sénégalaise continue sur sa dynamique positive portée par les secteurs des services et de l\'industrie.',
    content: `
      <p>L'Agence nationale de la statistique et de la démographie (ANSD) a publié ses estimations pour le troisième trimestre 2026, indiquant une croissance économique de 6,8% sur un an. Cette performance confirme la tendance positive observée depuis le début de l'année.</p>
      
      <p>Les secteurs moteurs de cette croissance sont les services (+8,2%), l'industrie (+5,4%) et l'agriculture (+4,1%). Le secteur tertiaire, en particulier les télécommunications et les services financiers, continue de jouer un rôle prépondérant dans la dynamique économique.</p>
      
      <h3>Analyse sectorielle</h3>
      
      <p>Le secteur industriel bénéficie de la mise en service de nouvelles installations, notamment dans le domaine de l'énergie et des mines. La production d'hydrocarbures a commencé à contribuer significativement au PIB national.</p>
      
      <p>L'agriculture, bien que confrontée à des défis climatiques, a pu maintenir une croissance positive grâce aux bonnes récoltes dans certaines zones et aux efforts d'investissement dans l'irrigation.</p>
    `,
    category: 'economie',
    author: {
      name: 'Fatou Sow',
      slug: 'fatou-sow',
    },
    publishedAt: '2026-10-03T08:15:00',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop',
    sources: [
      {
        id: 's3',
        name: 'ANSD',
        type: 'statistical',
        url: 'https://www.ansd.sn',
        description: 'Note de conjoncture T3 2026',
      },
    ],
    relatedArticles: ['1'],
  },
  {
    id: '3',
    slug: 'education-nouvelle-reforme-secondaire',
    title: 'Réforme de l\'enseignement secondaire : le plan détaillé présenté',
    excerpt: 'Le ministère de l\'Éducation dévoile les contours de la réforme du lycée qui entrera en vigueur à la rentrée 2027.',
    content: `
      <p>Le ministère de l'Éducation nationale a présenté ce mardi le plan détaillé de la réforme de l'enseignement secondaire. Cette réforme, annoncée depuis plusieurs mois, vise à moderniser le système éducatif et à mieux préparer les élèves aux défis du XXIe siècle.</p>
      
      <p>Les principaux changements incluent une réorganisation des filières, un renforcement de l'enseignement scientifique et technologique, et une meilleure articulation entre le secondaire et l'enseignement supérieur.</p>
      
      <h3>Les mesures phares</h3>
      
      <p>La réforme introduit notamment :</p>
      <ul>
        <li>Un nouveau tronc commun plus large pour les classes de seconde</li>
        <li>Des options renforcées en sciences, technologies et langues</li>
        <li>Une meilleure orientation des élèves vers les filières adaptées</li>
        <li>Des programmes actualisés intégrant les enjeux contemporains</li>
      </ul>
    `,
    category: 'societe',
    author: {
      name: 'Moussa Ndiaye',
      slug: 'moussa-ndiaye',
    },
    publishedAt: '2026-10-02T16:30:00',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=450&fit=crop',
    sources: [
      {
        id: 's4',
        name: 'Ministère de l\'Éducation nationale',
        type: 'government',
        description: 'Document de présentation de la réforme',
      },
    ],
    relatedArticles: ['1'],
  },
  {
    id: '4',
    slug: 'festival-de-dakar-2026-programme',
    title: 'Festival de Dakar 2026 : un programme riche et éclectique',
    excerpt: 'La 25ème édition du festival de Dakar promet d\'être exceptionnelle avec des artistes internationaux et une programmation innovante.',
    content: `
      <p>Les organisateurs du Festival de Dakar ont dévoilé le programme de la 25ème édition qui se tiendra du 15 au 30 novembre 2026. Avec plus de 200 artistes venus de 30 pays, cette édition s'annonce comme l'une des plus ambitieuses de l'histoire du festival.</p>
      
      <p>Le festival proposera des concerts, des expositions, des conférences et des ateliers dans plusieurs lieux de la capitale. La programmation met particulièrement l'accent sur la création contemporaine africaine et les échanges culturels internationaux.</p>
    `,
    category: 'culture',
    author: {
      name: 'Aïcha Ba',
      slug: 'aicha-ba',
    },
    publishedAt: '2026-10-02T14:20:00',
    sources: [
      {
        id: 's5',
        name: 'Festival de Dakar',
        type: 'organization',
        description: 'Communiqué de presse officiel',
      },
    ],
  },
  {
    id: '5',
    slug: 'equipe-nationale-foot-can-2027',
    title: 'Équipe nationale de football : préparation pour la CAN 2027',
    excerpt: 'Les Lions de la Teranga entament leur préparation pour la Coupe d\'Afrique des Nations qui se tiendra en Côte d\'Ivoire.',
    content: `
      <p>L'équipe nationale du Sénégal a commencé sa préparation pour la Coupe d'Afrique des Nations 2027. Le sélectionneur a annoncé une liste de 30 joueurs qui participeront aux stages de préparation.</p>
      
      <p>Les Lions de la Teranga visent une nouvelle performance après leur titre historique en 2022. L'équipe devra faire face à une concurrence accrue dans cette édition.</p>
    `,
    category: 'sport',
    author: {
      name: 'Ibrahima Fall',
      slug: 'ibrahima-fall',
    },
    publishedAt: '2026-10-02T11:45:00',
    sources: [
      {
        id: 's6',
        name: 'FSF',
        type: 'organization',
        description: 'Fédération Sénégalaise de Football',
      },
    ],
  },
  {
    id: '6',
    slug: 'relations-senegal-ue-sommet-2026',
    title: 'Sommet Sénégal-Union européenne : nouveaux partenariats annoncés',
    excerpt: 'Le président sénégalais et les dirigeants européens ont conclu plusieurs accords lors du sommet bisannuel.',
    content: `
      <p>Le sommet bisannuel entre le Sénégal et l'Union européenne s'est tenu ce jeudi à Bruxelles. Les discussions ont porté sur le partenariat économique, la coopération en matière de sécurité et les enjeux climatiques.</p>
      
      <p>Plusieurs accords ont été signés, notamment dans les domaines de l'énergie renouvelable, de l'agriculture durable et de la migration légale.</p>
    `,
    category: 'monde',
    author: {
      name: 'Cheikh Tidiane Diop',
      slug: 'cheikh-tidiane-diop',
    },
    publishedAt: '2026-10-01T17:00:00',
    sources: [
      {
        id: 's7',
        name: 'Conseil de l\'Union européenne',
        type: 'organization',
        description: 'Communiqué du sommet',
      },
    ],
  },
  {
    id: '7',
    slug: 'comprendre-fonctionnement-budget-senegal',
    title: 'Comprendre le fonctionnement du budget de l\'État sénégalais',
    excerpt: 'Explication détaillée des mécanismes budgétaires au Sénégal : de l\'élaboration à l\'exécution.',
    content: `
      <p>Le budget de l'État est un instrument essentiel de la politique publique. Au Sénégal, son élaboration et son exécution suivent un processus strictement encadré par la loi organique relative aux lois de finances.</p>
      
      <h3>Les étapes du processus budgétaire</h3>
      
      <p>Le cycle budgétaire sénégalais comprend plusieurs phases :</p>
      <ul>
        <li><strong>Préparation</strong> : Les ministères élaborent leurs propositions budgétaires</li>
        <li><strong>Examen</strong> : Le ministère de l'Économie coordonne et consolide le budget</li>
        <li><strong>Adoption</strong> : Le Parlement vote la loi de finances</li>
        <li><strong>Exécution</strong> : Mise en œuvre du budget par les administrations</li>
        <li><strong>Contrôle</strong> : La Cour des comptes vérifie l'exécution</li>
      </ul>
    `,
    category: 'comprendre',
    author: {
      name: 'Mame Diarra',
      slug: 'mame-diarra',
    },
    publishedAt: '2026-10-01T10:30:00',
    sources: [
      {
        id: 's8',
        name: 'Direction du Budget',
        type: 'government',
        description: 'Guide du processus budgétaire',
      },
    ],
  },
  {
    id: '8',
    slug: 'verification-rumeur-hausse-prix-carburant',
    title: 'Vérification : Le prix de l\'essence va-t-il augmenter de 20% la semaine prochaine ?',
    excerpt: 'Une information circule sur les réseaux sociaux concernant une hausse annoncée des prix des carburants. Nous avons vérifié.',
    content: `
      <p>Une information largement partagée sur les réseaux sociaux affirme que le prix de l\'essence augmentera de 20% à partir de la semaine prochaine. Nous avons enquêté sur cette affirmation.</p>
      
      <h3>Ce qui est affirmé</h3>
      
      <p>Plusieurs publications Facebook et WhatsApp prétendent que le gouvernement a décidé d\'une hausse de 20% du prix de l\'essence et du diesel, effective dès lundi prochain.</p>
      
      <h3>Ce que montrent les sources</h3>
      
      <p>Nous avons contacté le ministère du Pétrole et des Énergies ainsi que la Commission de régulation du secteur de l\'électricité (CSE). Aucune décision de hausse des prix n\'a été prise.</p>
      
      <p>Les prix des carburants au Sénégal sont fixés par décret après consultation de la CSE. Le dernier ajustement date du 15 septembre 2026.</p>
      
      <h3>Conclusion</h3>
      
      <p>L\'information selon laquelle le prix de l\'essence augmentera de 20% la semaine prochaine est <strong>fausse</strong>. Aucune décision officielle n\'a été prise dans ce sens.</p>
    `,
    category: 'verifie',
    author: {
      name: 'Équipe Vérification',
      slug: 'equipe-verification',
    },
    publishedAt: '2026-10-01T09:00:00',
    sources: [
      {
        id: 's9',
        name: 'Ministère du Pétrole et des Énergies',
        type: 'government',
        description: 'Réponse à notre demande de confirmation',
      },
      {
        id: 's10',
        name: 'CSE',
        type: 'government',
        description: 'Commission de régulation du secteur de l\'électricité',
      },
    ],
  },
]

export const getArticleBySlug = (slug: string): Article | undefined => {
  return articles.find((article) => article.slug === slug)
}

export const getArticlesByCategory = (category: string): Article[] => {
  return articles.filter((article) => article.category === category)
}

export const getRelatedArticles = (articleId: string): Article[] => {
  const article = articles.find((a) => a.id === articleId)
  if (!article || !article.relatedArticles) return []
  return articles.filter((a) => article.relatedArticles?.includes(a.id))
}
