import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

/**
 * Enterprise Persona Vault Manager
 * Handles encrypted storage of user identities.
 */
export class PersonaManager {
    private static ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-!!-nova'

    /**
     * Encrypts and saves a persona.
     */
    static async savePersona(userId: string, name: string, personaData: any) {
        const encryptedData = this.encrypt(JSON.stringify(personaData))

        return prisma.persona.create({
            data: {
                userId,
                name,
                data: encryptedData
            }
        })
    }

    /**
     * Decrypts and retrieves a persona.
     */
    static async getPersona(personaId: string) {
        const persona = await prisma.persona.findUnique({ where: { id: personaId } })
        if (!persona) return null

        const decryptedData = this.decrypt(persona.data)
        return {
            ...persona,
            data: JSON.parse(decryptedData)
        }
    }

    private static encrypt(text: string): string {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.ENCRYPTION_KEY), iv)
        let encrypted = cipher.update(text)
        encrypted = Buffer.concat([encrypted, cipher.final()])
        return iv.toString('hex') + ':' + encrypted.toString('hex')
    }

    private static decrypt(text: string): string {
        const [ivHex, encryptedHex] = text.split(':')
        const iv = Buffer.from(ivHex, 'hex')
        const encryptedText = Buffer.from(encryptedHex, 'hex')
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.ENCRYPTION_KEY), iv)
        let decrypted = decipher.update(encryptedText)
        decrypted = Buffer.concat([decrypted, decipher.final()])
        return decrypted.toString()
    }
}
