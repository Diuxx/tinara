# Rapport de migration des URLs - TINARA

## Objectif

Migration des anciennes URLs en `.html` vers une structure propre en dossiers avec `index.html`.

Exemple : `/parrainage.html` devient `/parrainage/` avec le fichier `/parrainage/index.html`.

## URLs migrées

- `/about.html` → `/about/` → `about//index.html`
- `/actualites.html` → `/actualites/` → `actualites//index.html`
- `/aider.html` → `/aider/` → `aider//index.html`
- `/articles/assurancemaladie.html` → `/articles/assurancemaladie/` → `articles/assurancemaladie//index.html`
- `/articles/interest.html` → `/articles/interest/` → `articles/interest//index.html`
- `/articles/launch.html` → `/articles/launch/` → `articles/launch//index.html`
- `/articles/why.html` → `/articles/why/` → `articles/why//index.html`
- `/dons.html` → `/dons/` → `dons//index.html`
- `/faq.html` → `/faq/` → `faq//index.html`
- `/mensuel.html` → `/mensuel/` → `mensuel//index.html`
- `/mentions.html` → `/mentions/` → `mentions//index.html`
- `/parrainage.html` → `/parrainage/` → `parrainage//index.html`
- `/ponctuel.html` → `/ponctuel/` → `ponctuel//index.html`

## Redirections 301

Un fichier `.htaccess` a été ajouté à la racine du site.

```apache
# TINARA - Migration URLs .html vers URLs propres en dossiers
# Exemple : /parrainage.html -> /parrainage/

Options -Indexes
RewriteEngine On

# Accueil : /index.html -> /
RewriteRule ^index\.html$ / [R=301,L]

# Pages internes : /page.html -> /page/
# Articles : /articles/slug.html -> /articles/slug/
# La query string est conservée automatiquement par Apache.
RewriteCond %{THE_REQUEST} \s/+(.+?)\.html[?\s]
RewriteRule ^(.+)\.html$ /$1/ [R=301,L]
```

## SEO

- `sitemap.xml` a été régénéré avec les nouvelles URLs propres.
- Les pages publiques possèdent désormais une balise canonical vers l'URL propre.
- Les anciennes URLs `.html` sont conservées uniquement dans la logique de redirection `.htaccess`.

## Ressources

Les chemins HTML vers les ressources locales ont été fiabilisés en chemins absolus depuis la racine :

- `/assets/css/...`
- `/assets/js/...`
- `/assets/images/...`
- `/assets/documents/...`

## Points de vigilance

- Tester le site via un serveur local ou sur l'hébergement, pas en ouvrant les fichiers directement en `file://`.
- Les URLs absolues `/assets/...` supposent que le site est publié à la racine du domaine.
- Après mise en ligne, tester les anciennes URLs `.html` pour vérifier les redirections 301.
