import vine from '@vinejs/vine'

export const pseudoValidator = vine.compile(
  vine.object({
    pseudo: vine.string().trim().toLowerCase().minLength(1).maxLength(30),
  })
)
