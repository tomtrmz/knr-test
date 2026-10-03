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
