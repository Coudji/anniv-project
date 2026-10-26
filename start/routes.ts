/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('accueil', {}).as('accueil')
router.post('/joueur', [controllers.Players, 'store'])
router.post('/joueur/reset', [controllers.Players, 'reset'])

router.get('/grille', [controllers.Grille, 'show']).as('grille')
router.get('/final', [controllers.Final, 'show']).as('final')
router.get('/categorie/:id', [controllers.Categories, 'show'])
router.post('/categorie/:id', [controllers.Categories, 'repondre'])
