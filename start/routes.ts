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

router.get('/grille', [controllers.Grille, 'show']).as('grille')
