# Maison Célestine — Thème Shopify (test technique KNR)

## Liens

| | |
|---|---|
| Fiche produit | https://knr-test-g8nbfzjp.myshopify.com/products/serum-precieux-regenerant |
| Back-office | https://admin.shopify.com/store/knr-test-g8nbfzjp |
| Éditeur du thème « KNR » | https://admin.shopify.com/store/knr-test-g8nbfzjp/themes/191296864290/editor |

La boutique est protégée par un mot de passe, communiqué dans la soumission de l'exercice.

## Installation

### Prérequis

- Node.js 24 (fichier `.nvmrc`)
- [Shopify CLI](https://shopify.dev/docs/storefronts/themes/tools/cli) 3.x ou plus
- Un accès à la boutique (compte collaborateur ou staff)

### Lancer le thème en local

```bash
git clone git@github.com:tomtrmz/knr-test.git
cd knr-test
nvm use
shopify theme dev --store knr-test-g8nbfzjp.myshopify.com
```

Autres commandes utiles :

```bash
shopify theme check                                   # lint Liquid / JSON
shopify theme pull --theme <id> --only templates/*    # récupérer les réglages faits dans l'éditeur
shopify theme push --unpublished                      # envoyer le thème sur la boutique
```

## Tiroir panier (test 2)

### Réglages dans l'éditeur du thème

En-tête → **Cart drawer** (sélectionner la section ouvre le tiroir dans l'aperçu) :

- bouton « Voir mon panier » (affiché ou non) et mention sous les boutons ;
- message affiché quand tous les paliers sont atteints ;
- collection des échantillons et titre du module ;
- **paliers** (blocs « Reward tier ») : seuil, libellé, icône, message (`[amount]` est remplacé par le montant restant, `[count]` par le nombre d'échantillons, aussi dans le libellé), avantage géré par le tiroir (aucun, échantillons avec leur nombre, ou produit offert avec le choix du produit). Les paliers se saisissent dans l'ordre croissant des seuils.

### Configuration du back-office

| Élément | Réglage |
|---|---|
| Échantillons | produits à 2 €, dans la collection `echantillons`, option « Taille » pour la contenance |
| Produits payants | collection `produits-payants` (hors échantillons et cadeau), utilisée par la réduction des échantillons |
| Produit offert | « Mini format offert », à **0 €** (prix barré 15 €) ; ajouté et retiré automatiquement par le tiroir |
| Réduction « Échantillons offerts » | automatique « Achetez X, obtenez Y » : 75 € minimum dans `produits-payants` → 3 produits de `echantillons` à 100 %, 1 utilisation par commande |
| Réduction « Livraison offerte » | automatique, livraison gratuite dès 50 € |
| Masquage | produit offert et échantillons masqués de la recherche et du sitemap (metafield `seo.hidden` = 1) et absents des collections visibles : ils doivent rester publiés sur la boutique en ligne pour pouvoir être ajoutés au panier |

Les seuils et le nombre d'échantillons existent à deux endroits : dans les paliers du thème (affichage et ajout automatique) et dans les réductions (gratuité au paiement). **Ils doivent rester alignés.** Pour changer de produit offert, il suffit de le choisir dans le palier, à condition qu'il soit à 0 €.
