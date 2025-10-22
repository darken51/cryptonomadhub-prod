# 📦 CryptoNomadHub - Guide de Sauvegarde et Restauration

## 🎯 Vue d'ensemble

Ce système de backup vous permet de sauvegarder complètement votre site et de le restaurer en cas de crash.

**Ce qui est sauvegardé :**
- ✅ Base de données PostgreSQL complète (tous les utilisateurs, conversations, transactions, etc.)
- ✅ Redis (sessions, cache)
- ✅ Fichiers de configuration (.env, docker-compose.yml)
- ✅ État Git (commit actuel + modifications non commitées)
- ✅ Code source complet (si pas de git)

---

## 📝 Commandes Essentielles

### 1. Créer un backup

```bash
# Backup avec nom automatique (timestamp)
./backup.sh

# Backup avec nom personnalisé
./backup.sh "nom-du-backup"

# Exemples :
./backup.sh "avant-mise-a-jour-majeure"
./backup.sh "production-stable-v1.2"
./backup.sh "avant-migration-claude"
```

### 2. Lister les backups disponibles

```bash
./list-backups.sh
```

### 3. Restaurer un backup

```bash
./restore.sh nom-du-backup

# Exemple :
./restore.sh chat-persistence-completed
```

---

## 🔥 En cas de CRASH - Procédure d'urgence

Si votre site crash complètement, voici comment restaurer :

### Étape 1 : Identifier le dernier backup valide

```bash
cd /home/fred/cryptonomadhub
./list-backups.sh
```

### Étape 2 : Restaurer le backup

```bash
./restore.sh nom-du-backup
```

Le script va automatiquement :
1. ⏸️ Arrêter les services
2. 📊 Restaurer la base de données
3. 💾 Restaurer Redis
4. ⚙️ Restaurer les configurations
5. 🔄 Redémarrer tous les services

### Étape 3 : Vérifier que le site fonctionne

```bash
# Vérifier l'état des containers
docker ps

# Accéder au site
# Frontend : http://localhost:3001
# Backend  : http://localhost:8001
```

---

## 📍 Emplacement des Backups

Tous les backups sont stockés dans :
```
/home/fred/cryptonomadhub/backups/
```

### Structure d'un backup :

```
backups/
└── chat-persistence-completed/
    ├── BACKUP_INFO.txt              # Informations du backup
    ├── database.sql                 # Dump PostgreSQL complet (2.1M)
    ├── redis_dump.rdb               # Données Redis
    ├── config/
    │   ├── backend.env              # Configuration backend
    │   ├── frontend.env.local       # Configuration frontend
    │   └── docker-compose.yml       # Configuration Docker
    ├── git_info.txt                 # Commit Git actuel
    └── uncommitted_changes.patch    # Modifications non commitées
```

---

## 💡 Bonnes Pratiques

### Quand créer un backup ?

✅ **TOUJOURS avant :**
- Mise à jour majeure
- Migration de base de données
- Changement de configuration important
- Déploiement en production
- Refactoring majeur du code

✅ **Régulièrement :**
- Quotidien (production)
- Hebdomadaire (développement)
- Avant/après chaque session de travail importante

### Nommage des backups

Utilisez des noms descriptifs :
```bash
./backup.sh "pre-migration-claude-20250118"
./backup.sh "before-defi-audit-refactor"
./backup.sh "production-stable-$(date +%Y%m%d)"
./backup.sh "chat-persistence-completed"
```

---

## 🔒 Sécurité

⚠️ **IMPORTANT : Les backups contiennent des données sensibles !**

- API keys (Anthropic, Etherscan, etc.)
- JWT secrets
- Données utilisateurs
- Mots de passe base de données

**Recommandations :**
1. Ne pas commit les backups dans Git
2. Sauvegarder sur un disque externe/cloud chiffré
3. Limiter l'accès aux fichiers de backup
4. Supprimer les vieux backups régulièrement

---

## 📤 Copier un Backup (pour sauvegarde externe)

### Sur le même serveur :

```bash
# Copier vers un disque externe
cp -r /home/fred/cryptonomadhub/backups/nom-du-backup /mnt/disque-externe/

# Créer une archive compressée
cd /home/fred/cryptonomadhub/backups
tar -czf backup-$(date +%Y%m%d).tar.gz nom-du-backup/
```

### Vers une machine distante (SCP) :

```bash
cd /home/fred/cryptonomadhub/backups
tar -czf backup.tar.gz nom-du-backup/
scp backup.tar.gz user@serveur-distant:/path/to/backups/
```

### Vers le cloud (exemple avec rsync) :

```bash
rsync -avz /home/fred/cryptonomadhub/backups/ user@cloud:/backups/cryptonomadhub/
```

---

## 🧪 Tester une Restauration

**Important :** Testez régulièrement vos backups !

```bash
# 1. Créer un backup de test
./backup.sh "test-backup-$(date +%Y%m%d)"

# 2. Faire des modifications (ex: ajouter un message dans le chat)

# 3. Restaurer le backup de test
./restore.sh "test-backup-$(date +%Y%m%d)"

# 4. Vérifier que tout est revenu à l'état précédent
```

---

## 🔧 Restauration Manuelle (si scripts ne marchent pas)

### 1. Restaurer la base de données manuellement :

```bash
docker exec -i nomadcrypto-postgres psql -U nomad < /home/fred/cryptonomadhub/backups/nom-du-backup/database.sql
```

### 2. Restaurer Redis manuellement :

```bash
docker stop nomadcrypto-redis
docker cp /home/fred/cryptonomadhub/backups/nom-du-backup/redis_dump.rdb nomadcrypto-redis:/data/dump.rdb
docker start nomadcrypto-redis
```

### 3. Restaurer les configurations :

```bash
cp /home/fred/cryptonomadhub/backups/nom-du-backup/config/backend.env /home/fred/cryptonomadhub/backend/.env
cp /home/fred/cryptonomadhub/backups/nom-du-backup/config/frontend.env.local /home/fred/cryptonomadhub/frontend/.env.local
```

### 4. Redémarrer les services :

```bash
cd /home/fred/cryptonomadhub
docker-compose restart
```

---

## ❓ FAQ

### Q: Combien de backups garder ?

**Recommandation :**
- Garder les 7 derniers backups quotidiens
- Garder les 4 derniers backups hebdomadaires
- Garder les backups avant chaque mise à jour majeure

### Q: Combien d'espace prennent les backups ?

Actuellement : **~2.4M par backup**
- Database: ~2.1M
- Config: ~4K
- Redis: ~4K
- Uncommitted changes: variable

### Q: Puis-je restaurer juste la base de données ?

Oui ! Regardez la section "Restauration Manuelle" ci-dessus.

### Q: Le backup fonctionne-t-il si le site est en cours d'utilisation ?

Oui, mais pour une cohérence maximale, il est préférable de :
1. Mettre le site en maintenance
2. Créer le backup
3. Réactiver le site

---

## 📞 Support

En cas de problème avec les backups/restauration :

1. Vérifier les logs Docker : `docker logs nomadcrypto-backend`
2. Vérifier l'état des containers : `docker ps`
3. Consulter le fichier BACKUP_INFO.txt dans le backup
4. Essayer une restauration manuelle (voir section ci-dessus)

---

## ✅ Checklist Post-Restauration

Après avoir restauré un backup, vérifier :

- [ ] Frontend accessible (http://localhost:3001)
- [ ] Backend accessible (http://localhost:8001)
- [ ] Connexion utilisateur fonctionne
- [ ] Chat AI répond correctement
- [ ] DeFi Audit fonctionne
- [ ] Base de données contient les bonnes données
- [ ] Tous les containers sont UP : `docker ps`

---

## 🎯 Backup Actuel

**Backup le plus récent :**
```
Nom : chat-persistence-completed
Date : 2025-01-18
Taille : 2.4M
État : ✅ Migration chat persistence terminée
```

**Contenu :**
- ✅ Base de données avec tables de chat (chat_conversations, chat_messages)
- ✅ Migration Claude AI (Haiku avec cache)
- ✅ Frontend avec sidebar conversations
- ✅ Configuration complète

**Pour restaurer cet état exact :**
```bash
./restore.sh chat-persistence-completed
```

---

📝 **Ce guide a été généré automatiquement lors de la création du système de backup.**
