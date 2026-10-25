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

router.on('/grille').renderInertia('grille', {}).as('grille')
