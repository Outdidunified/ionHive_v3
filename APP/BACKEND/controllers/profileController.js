const db_conn = require('../config/db');
const emailer = require('../middlewares/emailer');
const logger = require('../utils/logger');

// USER DETAILS
// CompleteProfile
const CompleteProfile = async (req, res) => {
    try {
        const { username, user_id, email_id, phone_number } = req.body;

        // Validate input fields (missing & type validation)
        if (!username || typeof username !== 'string' ||
            !email_id || typeof email_id !== 'string' ||
            !user_id || !Number.isInteger(Number(user_id)) ||
            !phone_number || !Number.isInteger(Number(phone_number))) {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: User ID and phone number must be integers, username and email ID must be strings, and all fields are required.'
            });
        }


        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection('users');

        // Check if the user exists
        const existingUser = await usersCollection.findOne({ user_id: user_id });
        if (!existingUser) {
            return res.status(404).json({ error: true, message: 'User not found' });
        }

        // Update user status
        const updateResult = await usersCollection.updateOne(
            { user_id: user_id },
            {
                $set: {
                    username: username,
                    phone_no: phone_number,
                    modified_by: email_id,
                    modified_date: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            logger.info(`${email_id} - Failed to update account, please try again later!`);
            return res.status(500).json({ error: true, message: 'Failed to update account, please try again later!' });
        }

        logger.info(`${email_id} - Account updated successfully!`);
        return res.status(200).json({ error: false, message: 'Account updated successfully!' });

    } catch (error) {
        logger.error(`editAccount - ${error.message}`);
        res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
};

// MANAGE ALL 
// RFID
// fetch RFID
const fetchRFID = async (req, res) => {
    try {
        const { email_id } = req.body;

        // Validate input field (missing & type validation)
        if (!email_id || typeof email_id !== 'string') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: Email ID is required and must be a string.'
            });
        }


        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection('users');
        const tagIdCollection = db.collection('tag_id');

        // Check if the user exists
        const existingUser = await usersCollection.findOne({ email_id, status: true });

        if (!existingUser) {
            return res.status(401).json({ error: true, message: 'User  not found' });
        }

        const RFID = existingUser.tag_id;

        // Check if RFID is null or undefined
        if (!RFID) {
            return res.status(401).json({ error: true, message: 'RFID is not assigned yet' });
        }

        const fetchTagID = await tagIdCollection.findOne({ id: RFID });

        if (!fetchTagID) {
            logger.warn(`Tag ID ${RFID} not found for ${email_id}`);
            return res.status(401).json({ error: true, message: 'RFID is not found' });
        }

        logger.info(`RFID ${RFID} successfully retrieved for ${email_id}`);
        return res.status(200).json({ error: false, message: fetchTagID });

    } catch (error) {
        logger.error(`fetchRFID - ${error.message}`);
        return res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
};
// Deactivate RFID
const DeactivateRFID = async (req, res) => {
    try {
        const { user_id, email_id, username, status, tag_id } = req.body;

        // Validate the input
        if (!username || typeof username !== 'string' ||
            !email_id || typeof email_id !== 'string' ||
            !Number.isInteger(Number(user_id)) ||
            !tag_id || typeof tag_id !== 'string' ||
            typeof status !== 'boolean') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: Please provide a valid username (string), email ID (string), user ID (integer), tag ID (string), and status (boolean).'
            });
        }


        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection('users');
        const tagIdCollection = db.collection('tag_id');

        // Check if the user exists
        const existingUser = await usersCollection.findOne({ email_id, status: true });

        if (!existingUser) {
            return res.status(401).json({ error: true, message: 'User  not found' });
        }


        // Check if the RFID (tag_id) exists
        const fetchTagID = await tagIdCollection.findOne({ tag_id });
        if (!fetchTagID) {
            return res.status(404).json({ error: true, message: 'RFID (Tag ID) not found in the system' });
        }

        // Deactivate the RFID
        const updateTagResult = await tagIdCollection.updateOne(
            { tag_id },
            {
                $set: {
                    status: false,
                    modified_by: email_id,
                    modified_date: new Date()
                }
            }
        );

        if (updateTagResult.modifiedCount === 0) {
            logger.error(`Failed to update RFID status for tag_id: ${tag_id}`);
            return res.status(500).json({ error: true, message: 'Failed to update RFID status' });
        }

        logger.info(`RFID ${tag_id} deactivated successfully by ${username}`);
        return res.status(200).json({ error: false, message: `RFID ${tag_id} deactivated successfully` });

    } catch (error) {
        logger.error(`DeactivateRFID - ${error.message}`);
        return res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
};
// DEVICES 
// Save Devices
const SaveDevices = async (req, res) => {
    try {
        const { user_id, email_id, charger_id, status } = req.body;

        // Validate input
        if (!user_id || !email_id || !charger_id || status === undefined ||
            !Number.isInteger(Number(user_id)) || typeof email_id !== 'string' ||
            typeof charger_id !== 'string' || typeof status !== 'boolean') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: user_id must be an integer, email_id must be a string, charger_id must be a string, and status must be a boolean.',
            });
        }

        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection('users');

        // Find the user with both user_id and email_id
        const user = await usersCollection.findOne({ user_id: user_id, email_id });

        if (!user) {
            logger.warn(`User ${user_id} with email ${email_id} not found.`);
            return res.status(404).json({
                error: true,
                message: 'User not found.',
            });
        }

        let updatedFavChargers = user.favChargers || [];

        // Check if charger_id already exists in favChargers
        const index = updatedFavChargers.findIndex(fav => fav.charger_id === charger_id);

        if (index !== -1) {
            if (!status) {
                // If status is false, remove the charger from the list
                updatedFavChargers.splice(index, 1);
            } else {
                // If charger exists, update its status
                updatedFavChargers[index].status = status;
            }
        } else if (status) {
            // If charger does not exist and status is true, add it to the array
            updatedFavChargers.push({ charger_id, status });
        }

        // Update the user's favorite chargers array
        const updateResult = await usersCollection.updateOne(
            { user_id: user_id, email_id },
            { $set: { favChargers: updatedFavChargers } }
        );

        if (updateResult.modifiedCount === 0) {
            logger.warn(`Failed to update favorite charger for user ${user_id} with email ${email_id}.`);
            return res.status(500).json({
                error: true,
                message: 'Failed to update favorite charger.',
            });
        }

        logger.info(`Favorite charger updated successfully for user ${user_id} with email ${email_id}.`);
        return res.status(200).json({
            error: false,
            message: status ? 'Favorite charger updated successfully' : 'Favorite charger removed successfully',
            updatedFavChargers,
        });

    } catch (error) {
        logger.error(`SaveStaions - ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
        });
    }
};
// fetch devices
const fetchSavedDevices = async (req, res) => {
    try {
        const { user_id, email_id } = req.body;


        // Validate request parameters
        if (!user_id || isNaN(user_id) || !email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid input: user_id must be a valid number and email_id must be a non-empty string',
            });
        }

        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection('users');
        const chargerDetailsCollection = db.collection('charger_details');
        const chargerStatusCollection = db.collection('charger_status');
        const financeDetailsCollection = db.collection('finance_details');

        // Find user and retrieve favorite chargers
        const user = await usersCollection.findOne(
            { user_id: Number(user_id), email_id },
            { projection: { favChargers: 1, _id: 0 } }
        );

        if (!user?.favChargers?.length) {
            return res.status(200).json({
                success: true,
                message: 'No favorite chargers found for this user',
                favChargers: []
            });
        }

        // Extract charger IDs
        const favChargerIds = user.favChargers
            .filter(item => typeof item === "object" && item.charger_id)
            .map(item => String(item.charger_id));


        // Fetch charger details
        const favChargers = await chargerDetailsCollection.find({
            charger_id: { $in: favChargerIds },
            status: true
        }).toArray();

        // Fetch detailed charger info
        const detailedFavChargers = await Promise.all(favChargers.map(async (charger) => {
            const chargerId = charger.charger_id;
            const status = await chargerStatusCollection.findOne({ charger_id: chargerId });

            let unitPrice = null;
            if (charger.finance_id) {
                const financeRecord = await financeDetailsCollection.findOne({ finance_id: charger.finance_id });

                if (financeRecord) {
                    const totalPercentage = [
                        financeRecord.app_charges,
                        financeRecord.other_charges,
                        financeRecord.parking_charges,
                        financeRecord.rent_charges,
                        financeRecord.open_a_eb_charges,
                        financeRecord.open_other_charges
                    ].reduce((sum, charge) => sum + parseFloat(charge || 0), 0);

                    const pricePerUnit = parseFloat(financeRecord.eb_charges || 0);
                    unitPrice = (pricePerUnit + (pricePerUnit * totalPercentage / 100)).toFixed(2);
                }
            }

            return { ...charger, status: status || null, unit_price: unitPrice };
        }));

        logger.info('Successfully fetched favorite chargers', { user_id, count: detailedFavChargers.length });

        return res.status(200).json({
            success: true,
            message: 'Favorite chargers retrieved successfully',
            favChargers: user.favChargers,
            favChargersDetails: detailedFavChargers
        });

    } catch (error) {
        logger.error('Error fetching favorite chargers', { error: error.message });
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};
// VEHICLE


// STATIONS
// SAVE STATIONS
// Save Stations
const SaveStations = async (req, res) => {
    try {
        const { user_id, email_id, LatLong, address, landmark, status } = req.body;

        // Validate request body
        if (!user_id || !email_id || !LatLong || !address || status === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: user_id, email_id, LatLong, address, or status',
            });
        }

        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection('users');

        // Find user by user_id and email_id
        const user = await usersCollection.findOne({ user_id, email_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        let updatedFavStations = user.favStations || [];

        // Check if station already exists in favStations
        const index = updatedFavStations.findIndex(station => station.LatLong === LatLong);

        if (index !== -1) {
            if (status === false) {
                // Remove station if status is false
                logger.info(`Removing favorite station for user ${user_id} at ${LatLong}`);
                updatedFavStations.splice(index, 1);
            } else {
                // Update status if station exists
                logger.info(`Updating favorite station status for user ${user_id} at ${LatLong}`);
                updatedFavStations[index].status = status;
            }
        } else if (status === true) {
            // Add new station if it does not exist
            logger.info(`Adding new favorite station for user ${user_id} at ${LatLong}`);
            updatedFavStations.push({ LatLong, address, landmark, status });
        }

        // Update the user's favorite stations array
        const updateResult = await usersCollection.updateOne(
            { user_id, email_id },
            { $set: { favStations: updatedFavStations } }
        );

        logger.info(`Favorite stations updated successfully for user ${user_id}`);

        return res.status(200).json({
            success: true,
            message: status ? 'Favorite station updated successfully' : 'Favorite station removed successfully',
            updatedFavStations,
        });

    } catch (error) {
        logger.error(`Error updating favorite station for user_id=${req.body.user_id}, email_id=${req.body.email_id}: ${error.message}`, error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};
// fetch Stations 
const fetchSavedStations = async (req, res) => {
    try {
        const { user_id, email_id } = req.body;

        // Validate request parameters
        if (!user_id || isNaN(user_id) || !email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid input: user_id must be a valid number and email_id must be a non-empty string',
            });
        }

        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection("users");


        // Find user and retrieve favorite stations
        const user = await usersCollection.findOne(
            { user_id, email_id },
            { projection: { favStations: 1, _id: 0 } }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        logger.info(`Favorite stations retrieved successfully for user: ${user_id}`);

        return res.status(200).json({
            success: true,
            message: "Favorite stations retrieved successfully",
            favStations: user.favStations || [],
        });

    } catch (error) {
        logger.error(`Error fetching favorite stations for user_id=${req.body?.user_id}, email_id=${req.body?.email_id}: ${error.message}`, { error });
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


// PAYMENT HOSTORY

// VECHICLE







// ACCOUNT
// deleteAccount
const deleteAccount = async (req, res) => {
    try {
        const { email_id, user_id, reason } = req.body;

        // Validate input (missing & type validation)
        if (!email_id || typeof email_id !== 'string' ||
            !user_id || !Number.isInteger(Number(user_id)) ||
            !reason || typeof reason !== 'string') {
            return res.status(401).json({
                error: true,
                message: 'Invalid input: User ID must be an integer, and Email ID & reason must be strings. All fields are required.'
            });
        }

        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection('users');

        // Check if the user exists
        const existingUser = await usersCollection.findOne({ user_id: user_id });
        if (!existingUser) {
            return res.status(404).json({ error: true, message: 'User not found' });
        }

        // Update user status
        const updateResult = await usersCollection.updateOne(
            { user_id: user_id },
            {
                $set: {
                    reason: reason,
                    status: false,
                    modified_by: email_id,
                    modified_date: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            logger.info(`${email_id} - Failed to delete account, Please try again later !`);
            return res.status(401).json({ error: true, message: 'Failed to delete account, Please try again later !' });
        }

        const sendEmail = await emailer.EmailConfig(email_id, mailHead = 'deleteAccount');

        if (sendEmail) {
            logger.info(`${email_id} - Delete account mail sent.`);
        }

        logger.info(`${email_id} - Account deleted successfully !`);
        return res.status(200).json({ error: false, message: `Account deleted successfully !` });
    } catch (error) {
        logger.info(`deleteAccount - ${error.message}`);
        res.status(500).json({ error: true, message: error.message });
    }
}

module.exports = {
    // USER DETAILS
    CompleteProfile,

    // MANAGE ALL 
    // RFID
    fetchRFID,
    DeactivateRFID,
    // DEVICES
    SaveDevices,
    fetchSavedDevices,
    // STATIONS
    SaveStations,
    fetchSavedStations,
    // ACCOUNT
    deleteAccount
};