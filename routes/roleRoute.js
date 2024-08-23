const express = require('express');
const Role = require('../models/Role.js');
const AuthorizationRole = require('../models/AuthorizationRoles.js');
const auth = require('../utils/jwtUtils.js');

const router = express.Router();

// Role Route
router.get('/roles', auth, async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json({ roles });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Role Add
router.post('/rolereg', async (req, res) => {
    const { code, name } = req.body;

    if (!name || !code) {
        return res.status(400).json({ message: 'Please provide code, name' });
    }

    try {
        const existingRole = await Role.findOne({ $or: [{ name }, { code }] });
        if (existingRole) {
            return res.status(400).json({ message: 'Role with this name or code already exists' });
        }
        
        const newRole = new Role({ code, name });
        await newRole.save();

        res.status(201).json({ message: 'Role registered successfully', role: newRole });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Role Delete
router.delete('/roles/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const roles = await Role.findById(id);
        if (!roles) {
            return res.status(404).json({ message: 'Role not found' });
        }

        await Role.deleteOne({ _id: id });
        res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


//Update Role
router.put('/roles/:id', async (req, res) => {
    const { id } = req.params;
    const { code, name } = req.body;

    try {
        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ message: 'role not found' });
        }

        if (code && code !== role.code) {
            const existingroleWithCode = await Role.findOne({ code });
            if (existingroleWithCode) {
                return res.status(400).json({ message: 'Code is already used by another role' });
            }
        }

        if (name && name !== role.name) {
            const existingroleWithName = await Role.findOne({ name });
            if (existingroleWithName) {
                return res.status(400).json({ message: 'Name is already used by another role' });
            }
        }

        role.code = code || role.code;
        role.name = name || role.name;

        await role.save();

        res.status(200).json({ message: 'role updated successfully', role });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Authorization Role Route
router.get('/authorizationRole', auth, async (req, res) => {
    try {
        const authorizationRoles = await AuthorizationRole.find();
        res.status(200).json({ authorizationRoles });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Role Add
router.post('/authorizationRole', async (req, res) => {
    const { role_name, role_id, role_code, action_name, action_id } = req.body;

    if (!role_name || !role_id || !role_code || !action_name || !action_id) {
        return res.status(400).json({ message: 'Please provide role and action' });
    }

    try {
        const existingRole = await AuthorizationRole.findOne({ $and: [{ role_name }, { action_name }] });
        if (existingRole) {
            return res.status(400).json({ message: 'Authorization Role with this name and code already exists' });
        }
        
        const newRole = new AuthorizationRole({ role_name, role_id, role_code, action_name, action_id });
        await newRole.save();

        res.status(201).json({ message: 'Authorization Role registered successfully', role: newRole });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Authorization Delete
router.delete('/authorizationRole/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const roles = await AuthorizationRole.findById(id);
        if (!roles) {
            return res.status(404).json({ message: 'Authorization Role not found' });
        }

        await AuthorizationRole.deleteOne({ _id: id });
        res.status(200).json({ message: 'Authorization Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

//Authorization Update
router.put('/authorizationRole/:id', async (req, res) => {
    const { id } = req.params;
    const { role_name, role_id, role_code, action_name, action_id } = req.body;

    try {
        const role = await AuthorizationRole.findById(id);
        if (!role) {
            return res.status(404).json({ message: 'Authorization Role not found' });
        }

        if ((role_name && role_name !== role.role_name) || (action_name && action_name !== role.action_name)) {
            const existingAuthRole = await AuthorizationRole.findOne({ $and: [{ role_name }, { action_name }] });
            if (existingAuthRole) {
                return res.status(400).json({ message: 'Authorization Role is already used by another' });
            }
        }

        role.role_name = role_name || role.role_name;
        role.role_id = role_id || role.role_id;
        role.role_code = role_code || role.role_code;
        role.action_name = action_name || role.action_name;
        role.action_id = action_id || role.action_id;

        await role.save();

        res.status(200).json({ message: 'Authorization Role updated successfully', role });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


//Get Action
router.get('/actions', (req, res) => {
    const options = [
        { id: '1', name: 'Dashboard Navigation' },
        { id: '2', name: 'Project Management Navigation' },
        { id: '3', name: 'Employee Registration Navigation' },
        { id: '4', name: 'Vendor Registration Navigation'},
        { id: '5', name: 'Client Registration Navigation'},
        { id: '6', name: 'Role Registration Navigation'},
        { id: '7', name: 'Authorization Role Navigation'},
        { id: '8', name: 'Procurement Navigation'},
        { id: '9', name: 'Inventory Navigation'},
        { id: '9', name: 'Configuration Navigation'},
        { id: '10', name: 'Approve Design'},
        { id: '11', name: 'Reject Design'},
        { id: '12', name: 'Approve Proposal'},
        { id: '13', name: 'Reject Proposal'},
        { id: '14', name: 'Delete Project'}
    ];
    res.json(options);
});

module.exports = router;
