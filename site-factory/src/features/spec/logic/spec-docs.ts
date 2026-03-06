export interface SpecReadingProfile {
  domain: string;
  coverage: string;
  role: string;
}

export interface SpecRelationship {
  spec: string;
  description: string;
}

export interface SpecConcept {
  term: string;
  definition: string;
}

export interface SpecReadingDoc {
  relationships: SpecRelationship[];
  concepts: SpecConcept[];
  editGuide: string[];
  impactWarning: string | null;
}

export interface SpecReadingRegistryEntry extends SpecReadingProfile, SpecReadingDoc {}

const DEFAULT_SPEC_READING_ENTRY: SpecReadingRegistryEntry = {
  domain: "Referentiel",
  coverage: "Parametres du referentiel",
  role: "Source de verite metier et technique",
  relationships: [],
  concepts: [],
  editGuide: [],
  impactWarning: null,
};

export const SPEC_READING_REGISTRY: Record<string, SpecReadingRegistryEntry> = {
  "cms.json": {
    domain: "Architecture",
    coverage: "CMS et supports pris en charge",
    role: "Catalogue les plateformes de base et leurs capacites structurelles",
    relationships: [
      {
        spec: "capability-matrix.json",
        description:
          "Chaque CMS defini ici correspond a une colonne dans la matrice.",
      },
      {
        spec: "stack-profiles.json",
        description:
          "implementationMapping re-utilise les ids CMS definis dans ce catalogue.",
      },
      {
        spec: "plugins.json",
        description:
          "Les plugins referencent les CMS via cmsIds et doivent rester alignes.",
      },
    ],
    concepts: [
      {
        term: "kind",
        definition:
          "Distingue les CMS orientes contenu, commerce, SaaS ou headless.",
      },
      {
        term: "editorialModel",
        definition:
          "Precise si le mode editorial est natif ou configurable.",
      },
      {
        term: "extensionModel",
        definition:
          "Indique si l'ecosysteme s'etend via plugins, apps, modules ou custom.",
      },
    ],
    editGuide: [
      "Ajouter un CMS implique une mise a jour coordonnee de la matrice, des plugins et des profils de stack.",
      "Verifier que le kind reste coherent avec le wizard et les filtres de selection.",
      "Conserver des ids stables car ils sont references partout dans le moteur.",
    ],
    impactWarning:
      "Un changement d'id ou de classification CMS casse les references croisees du moteur de decision.",
  },
  "features.json": {
    domain: "Offre fonctionnelle",
    coverage: "Features atomiques proposees au client",
    role: "Decrit les besoins fonctionnels manipules par le wizard et le devis",
    relationships: [
      {
        spec: "capability-matrix.json",
        description:
          "Chaque feature.id doit apparaitre dans la matrice avec une ligne complete.",
      },
      {
        spec: "plugins.json",
        description:
          "Les plugins pointent vers les features via featureIds.",
      },
      {
        spec: "decision-rules.json",
        description:
          "Le moteur parcourt ces features pour calculer la recommandation.",
      },
    ],
    concepts: [
      {
        term: "domain",
        definition:
          "Groupe les features par grand domaine dans le wizard et la lecture catalogue.",
      },
      {
        term: "uiOnly",
        definition:
          "Signale une feature uniquement visuelle, sans impact structurel sur le pricing.",
      },
      {
        term: "type",
        definition:
          "Permet d'appliquer des regles specifiques selon la nature de la feature.",
      },
    ],
    editGuide: [
      "Conserver la convention d'id feature.* et eviter toute rupture de reference.",
      "Ajouter toute nouvelle feature dans capability-matrix.json.",
      "Verifier qu'une feature uiOnly reste non structurante pour le devis.",
    ],
    impactWarning:
      "Renommer un feature.id casse les references dans la matrice, les plugins et les projets existants.",
  },
  "plugins.json": {
    domain: "Offre fonctionnelle",
    coverage: "Extensions tierces et couts recurrents",
    role: "Reference les plugins et apps utilises comme solutions d'implementation",
    relationships: [
      {
        spec: "features.json",
        description:
          "Chaque plugin declare les features qu'il couvre via featureIds.",
      },
      {
        spec: "capability-matrix.json",
        description:
          "La matrice s'appuie sur ce catalogue quand une implementation passe par plugin/app.",
      },
      {
        spec: "commercial.json",
        description:
          "Les couts de plugins alimentent les charges recurrentes du devis.",
      },
    ],
    concepts: [
      {
        term: "pricingMode",
        definition:
          "Distingue les plugins gratuits, payants ou mixtes.",
      },
      {
        term: "billingCycle",
        definition:
          "Precise si le cout est mensuel, annuel, one-shot ou a l'usage.",
      },
      {
        term: "amortization",
        definition:
          "Indique si le cout est absorbe au setup ou lisse dans l'abonnement.",
      },
    ],
    editGuide: [
      "Verifier que les cmsIds correspondent au catalogue cms.json.",
      "Renseigner la facturation minimale pour tout plugin non gratuit.",
      "Tenir a jour les prix annuels et les remises de renouvellement.",
    ],
    impactWarning:
      "Des prix plugin errones faussent directement le recurrent annonce au client.",
  },
  "modules.json": {
    domain: "Implementation",
    coverage: "Modules framework reutilisables",
    role: "Decrit les briques de developpement sur-mesure recurrentes",
    relationships: [
      {
        spec: "capability-matrix.json",
        description:
          "recommendedModuleId doit pointer vers un module defini ici.",
      },
      {
        spec: "decision-rules.json",
        description:
          "Le ciImpact de chaque module alimente l'indice de complexite.",
      },
    ],
    concepts: [
      {
        term: "targetCategory",
        definition:
          "Categorie projet a partir de laquelle le module devient pertinent.",
      },
      {
        term: "isStructurant",
        definition:
          "Signale un module susceptible de faire monter la categorie projet.",
      },
      {
        term: "ciImpact",
        definition:
          "Contribution du module aux axes SA, DE, CB et SD du score de complexite.",
      },
    ],
    editGuide: [
      "Conserver la convention module.* pour les ids.",
      "Verifier les fourchettes setup et mensuelles avant de toucher aux modules structurants.",
      "Tester l'impact CI quand un module change de categorie cible.",
    ],
    impactWarning:
      "Un module structurant mal parametre peut requalifier un projet et changer toute la grille tarifaire.",
  },
  "capability-matrix.json": {
    domain: "Moteur de decision",
    coverage: "Correspondance feature x CMS",
    role: "Explique comment chaque feature est implementee selon la stack",
    relationships: [
      {
        spec: "features.json",
        description:
          "Les featureId doivent correspondre exactement au catalogue de features.",
      },
      {
        spec: "plugins.json",
        description:
          "Les recommandations plugin doivent pointer vers des plugin.ids existants.",
      },
      {
        spec: "modules.json",
        description:
          "Les recommandations module doivent pointer vers des module.ids existants.",
      },
      {
        spec: "decision-rules.json",
        description:
          "Le decisionFlow canonique exploite directement les classifications de cette matrice.",
      },
    ],
    concepts: [
      {
        term: "CMS_NATIVE",
        definition:
          "Implementation native sans extension ni surcout structurel.",
      },
      {
        term: "PLUGIN_INTEGRATION",
        definition:
          "Implementation via plugin ou app tierce, avec cout recurrent potentiel.",
      },
      {
        term: "FRAMEWORK_MODULE",
        definition:
          "Implementation via un module framework reutilisable.",
      },
      {
        term: "CUSTOM_APP",
        definition:
          "Fallback sur du sur-mesure quand aucune option standard ne couvre la feature.",
      },
    ],
    editGuide: [
      "Verifier que chaque feature dispose d'une ligne complete pour tous les CMS.",
      "Conserver la coherence entre classification et recommandation plugin/module.",
      "Rejouer les cas critiques du moteur quand une classification change.",
    ],
    impactWarning:
      "Une classification modifiee change le CMS recommande et le cout estime du projet.",
  },
  "decision-rules.json": {
    domain: "Moteur de decision",
    coverage: "Regles, seuils et garde-fous",
    role: "Pilote la qualification, la categorisation et les invariants metier",
    relationships: [
      {
        spec: "capability-matrix.json",
        description:
          "Le moteur exploite la matrice pour prioriser natif, plugin, module puis custom.",
      },
      {
        spec: "commercial.json",
        description:
          "Les regles economiques doivent rester coherentes avec les grilles commerciales.",
      },
      {
        spec: "stack-profiles.json",
        description:
          "Les familles backend et profils de stack doivent suivre les categories projet.",
      },
      {
        spec: "modules.json",
        description:
          "Les modules structurants alimentent la qualification via le CI.",
      },
    ],
    concepts: [
      {
        term: "CAT0-CAT4",
        definition:
          "Echelle de complexite projet utilisee par le wizard et le devis.",
      },
      {
        term: "complexityIndex",
        definition:
          "Score calcule a partir de plusieurs axes techniques et business.",
      },
      {
        term: "invariants",
        definition:
          "Regles metier non negociables qui encadrent la qualification.",
      },
      {
        term: "constraints",
        definition:
          "Contraintes repondant aux questions de qualification du projet.",
      },
    ],
    editGuide: [
      "Tester des cas reels avant de modifier poids, seuils ou guardrails.",
      "Conserver des seuils croissants et des invariants explicites.",
      "Verifier la coherence avec commercial.json apres toute retouche economique.",
    ],
    impactWarning:
      "Ce fichier pilote le cerveau du moteur. Une erreur fait basculer categories, stacks et prix.",
  },
  "commercial.json": {
    domain: "Commercial",
    coverage: "Grilles tarifaires et couts recurrents",
    role: "Fixe les parametres financiers exploites par le devis",
    relationships: [
      {
        spec: "decision-rules.json",
        description:
          "Les categories et garde-fous doivent rester alignes avec les regles economiques.",
      },
      {
        spec: "plugins.json",
        description:
          "Les couts plugin sont integres au devis recurrent via ces regles.",
      },
      {
        spec: "stack-profiles.json",
        description:
          "Les compatibilites de deploiement et couts d'hebergement doivent suivre les stacks.",
      },
    ],
    concepts: [
      {
        term: "basePackageBandsByCategory",
        definition:
          "Fourchettes de prix setup visibles des le debut du devis.",
      },
      {
        term: "maintenanceByCategory",
        definition:
          "Plans de maintenance mensuelle associes a chaque categorie.",
      },
      {
        term: "stackDeployCompat",
        definition:
          "Compatibilites entre familles de stack et cibles de deploiement.",
      },
    ],
    editGuide: [
      "Garder des min et max coherents dans toutes les fourchettes.",
      "Verifier les tarifs d'hebergement et SaaS avant publication.",
      "Faire valider les changements structurels avec la partie commerciale.",
    ],
    impactWarning:
      "Une modification ici impacte immediatement les devis generes et les estimations budgetaires.",
  },
  "custom-stacks.json": {
    domain: "Architecture",
    coverage: "Stacks custom et criteres d'eligibilite",
    role: "Documente les cas hors profils standards",
    relationships: [
      {
        spec: "decision-rules.json",
        description:
          "Les profils custom s'activent en fonction de la qualification et des flags projet.",
      },
      {
        spec: "stack-profiles.json",
        description:
          "Ces profils existent en dehors des familles standards et servent de garde-fous d'escalade.",
      },
    ],
    concepts: [
      {
        term: "allowedIf",
        definition:
          "Conditions minimales pour autoriser une stack custom sur un projet.",
      },
      {
        term: "implies",
        definition:
          "Effets induits sur la maintenance ou la categorie projet.",
      },
      {
        term: "budgetHint",
        definition:
          "Fourchette indicative pour cadrer le budget d'une stack custom.",
      },
    ],
    editGuide: [
      "Conserver des conditions d'eligibilite strictes et explicites.",
      "Verifier que les implications restent coherentes avec la maintenance et la categorie cible.",
    ],
    impactWarning:
      "Des gardes trop permissifs ouvrent des stacks custom sur des projets qui ne peuvent pas les absorber.",
  },
  "stack-profiles.json": {
    domain: "Architecture",
    coverage: "Familles et profils techniques",
    role: "Associe les choix techniques aux profils de stack et aux familles de pricing",
    relationships: [
      {
        spec: "cms.json",
        description:
          "implementationMapping associe chaque CMS a un profil par defaut.",
      },
      {
        spec: "commercial.json",
        description:
          "Les familles de stack alimentent pricing et maintenance minimum.",
      },
      {
        spec: "decision-rules.json",
        description:
          "La qualification oriente le projet vers une famille ou un profil de stack.",
      },
    ],
    concepts: [
      {
        term: "family",
        definition:
          "Famille de stack regroupe des profils techniques et leur plancher de pricing.",
      },
      {
        term: "profile",
        definition:
          "Profil concret de stack avec capacites, compatibilites et notes de pricing.",
      },
      {
        term: "implementationMapping",
        definition:
          "Pont entre le choix CMS et le profil technique utilise par defaut.",
      },
    ],
    editGuide: [
      "Verifier qu'un profil reference toujours une famille existante.",
      "Mettre a jour implementationMapping quand un nouveau profil est introduit.",
      "Controler la coherence des maintenance floors avec commercial.json.",
    ],
    impactWarning:
      "Ces profils pilotent directement les stacks recommandees et leur prix plancher.",
  },
  "shared-socle.json": {
    domain: "Socle partage",
    coverage: "Exigences techniques communes",
    role: "Decrit le minimum technique partage et les adaptations par stack",
    relationships: [
      {
        spec: "commercial.json",
        description:
          "Les references commerciales pointent vers des couts portes par commercial.json.",
      },
      {
        spec: "cms.json",
        description:
          "Les deltas par stack reprennent les specificites des CMS et plateformes supportes.",
      },
    ],
    concepts: [
      {
        term: "baselineRequirements",
        definition:
          "Exigences minimales applicables a tous les projets.",
      },
      {
        term: "stackDeltas",
        definition:
          "Adaptations a appliquer selon la stack ou le CMS choisi.",
      },
      {
        term: "commercialReferences",
        definition:
          "Points de raccord avec les couts ou plans du referentiel commercial.",
      },
    ],
    editGuide: [
      "Garder la baseline generique et deplacer les specificites dans stackDeltas.",
      "Verifier toute reference commerciale avant d'ajouter une exigence au socle.",
    ],
    impactWarning:
      "Ce socle represente le minimum garanti au client. Toute baisse de standard se propage partout.",
  },
  "infra-services.json": {
    domain: "Infrastructure",
    coverage: "Services infra optionnels",
    role: "Reference les briques d'infrastructure activables par projet",
    relationships: [
      {
        spec: "commercial.json",
        description:
          "Les couts de setup et recurrents s'articulent avec les hypotheses commerciales.",
      },
      {
        spec: "stack-profiles.json",
        description:
          "Les compatibilites d'hebergement et contraintes Docker doivent rester coherentes avec les stacks.",
      },
      {
        spec: "shared-socle.json",
        description:
          "Certaines briques prolongent ou renforcent le socle partage.",
      },
    ],
    concepts: [
      {
        term: "requiresDocker",
        definition:
          "Precise si le service n'est activable que sur une cible Docker/VPS.",
      },
      {
        term: "minMaintenanceCat",
        definition:
          "Categorie de maintenance minimale pour exploiter correctement le service.",
      },
      {
        term: "hostingImpact",
        definition:
          "Impact infra, notamment en RAM et en contraintes d'hebergement.",
      },
    ],
    editGuide: [
      "Verifier les ressources necessaires avant d'ajouter un service lourd.",
      "Conserver des categories de maintenance minimales realistes.",
      "Tenir a jour les couts de setup et recurrents quand la stack evolue.",
    ],
    impactWarning:
      "Un service sous-estime peut rendre une stack non viable en production ou fausser le cout recurrent.",
  },
};

export function getSpecReadingEntry(specFile: string): SpecReadingRegistryEntry {
  return SPEC_READING_REGISTRY[specFile] ?? DEFAULT_SPEC_READING_ENTRY;
}

export function getRelatedSpecs(specFile: string): string[] {
  return getSpecReadingEntry(specFile).relationships.map((entry) => entry.spec);
}
