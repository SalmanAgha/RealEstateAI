const prisma = require('../models/db');
const { logActivity } = require('../utils/logger');

/**
 * Get all roles and their permissions
 */
const getAllRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            orderBy: { createdAt: 'asc' }
        });
        res.json({ status: 'success', data: roles });
    } catch (error) {
        console.error("Get Roles error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch neural roles' });
    }
};

/**
 * Create a new operational role
 */
const createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        
        const existingRole = await prisma.role.findUnique({ where: { name } });
        if (existingRole) {
            return res.status(400).json({ status: 'error', message: 'Identity role already exists' });
        }

        const role = await prisma.role.create({
            data: { name, description, permissions }
        });

        await logActivity(req.user.id, 'ROLE_CREATED', null, { roleName: name });
        res.status(201).json({ status: 'success', data: role });
    } catch (error) {
        console.error("Create Role error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to initialize role' });
    }
};

/**
 * Update an existing role's permissions or metadata
 */
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;

        const role = await prisma.role.update({
            where: { id },
            data: { name, description, permissions }
        });

        await logActivity(req.user.id, 'ROLE_UPDATED', null, { roleId: id, name });
        res.json({ status: 'success', data: role });
    } catch (error) {
        console.error("Update Role error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to commit role adjustments' });
    }
};

/**
 * Delete a role from the registry
 */
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.role.delete({ where: { id } });

        await logActivity(req.user.id, 'ROLE_DELETED', null, { roleId: id });
        res.json({ status: 'success', message: 'Role deprovisioned successfully' });
    } catch (error) {
        console.error("Delete Role error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to deprovision role' });
    }
};

module.exports = {
    getAllRoles,
    createRole,
    updateRole,
    deleteRole
};
