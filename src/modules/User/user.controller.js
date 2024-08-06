// modules imports
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import otpGenerator from 'otp-generator';
// files imports
import User from '../../../DB/models/user.model.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/generate-unique-string.js';
import sendEmailService from '../../services/send-mail.service.js';
// ============================== signUp api ================================= //

/*
    // 1 - destructing the required data
    // 2 - check if the user is already existe
    // 3 - create user token for sending confirmation email to the user
    // 4 - sending the email
    // 5 - check if the email sent
    // 6 - create userName by combining the first and last names
    // 7 - hash the password
    // 8 - create unique folder for each user 
    // 9 - create the user image object
    // 10 - check if the user uploaded an imgae
            // 10.1 - add the folder in request object so that if any error occure while uploading the image it will not upload due to rollback 
    // 11 - creating the user object
    // 12 - creating the user document
    // 13 - add the data of the new document to the request object for the rollback 
    // 14 - check if user's document created or not
    // 15 - return the response
*/

export const signUp = async (req, res, next) => {
    // 1 - destructing the required data
    const { firstName, lastName, email, password, recoveryEmail, mobileNumber, DOB, role } = req.body;
    // 2 - check if the user is already exist
    const UserExist = await User.findOne({
        $or: [
            { email },
            { mobileNumber }
        ]
    });
    if (UserExist) {
        return next(new Error('user already exist , please signIn', { cause: 409 }));
    }
    // 3 - create user token for sending confirmation email to the user
    const userToken = jwt.sign({ email }, process.env.JWT_SECRET_VEREFICATION, { expiresIn: '1h' });
    // 4 - sending the email
    const isEmailSent = await sendEmailService({
        to: email,
        subject: 'account verification',
        message: `<section style="width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
        <div style="width: 50%; background-color: rgba(128, 128, 128,0.3); height: 20vh; border-radius: .625rem; text-align: center;">
            <h2 style=" color: black; text-shadow: 7px 7px 5px  white;display:block;font-size:25px;">Please click the link to verify your account</h2>
            <a style="text-decoration: none; font-size: 20px; " href='http://localhost:3000/user/verify-email?token=${userToken}'>Verify Account</a>
        </div>
    </section>`
    });
    // 5 - check if the email sent
    if (!isEmailSent) {
        return next(new Error(`unable to send email , please try again later`, { cause: 500 }));
    }
    // 6 - create userName by combining the first and last names
    const userName = firstName + ' ' + lastName;
    // 7 - hash the password
    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);
    // 8 - create unique folder for each user 
    const UserfolderId = generateUniqueString(13);
    // 9 - create the user image object
    let userImg = {
        secure_url: '',
        public_id: ''
    }
    // 10 - check if the user uploaded an imgae
    if (!req.file) {
        userImg = {
            secure_url: '',
            public_id: ''
        }
    } else {
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_MEDIA_FOLDER}/USERS/${UserfolderId}/user_picture`
        })
        // 10.1 - add the folder in request object so that if any error occure while uploading the image it will not upload due to rollback 
        req.folder = `${process.env.MAIN_MEDIA_FOLDER}/USERS/${UserfolderId}/user_picture`;
        userImg = {
            secure_url,
            public_id
        }
    }
    // 11 - creating the user object
    const UserData = {
        firstName,
        lastName,
        userName,
        email,
        password: hashedPassword,
        recoveryEmail,
        mobileNumber,
        DOB,
        userImg,
        mediaFolderId: '',
        role
    }
    if (userImg.public_id === '' && userImg.secure_url === '') {
        UserData.mediaFolderId = '';
    } else {
        UserData.mediaFolderId = UserfolderId;
    }
    // 12 - creating the user document
    const newUser = await User.create(UserData);
    // 13 - add the data of the new document to the request object for the rollback 
    req.savedDocument = { model: User, _id: newUser._id };
    // 14 - check if user's document created or not
    if (!newUser) {
        return next(new Error('something went wrong, please try again', { cause: 500 }));
    };
    // 15 - return the response
    return res.status(201).json({
        success: true,
        message: 'user created successfully , please check your email to verify your account',
        data: newUser
    });
}

// ============================== signIn api ================================= //

/*
    // 1 - destructing the required data
    // 2 - check if the user is already exist by using email or mobile phone
    // 3 - check the password
    // 4 - create user token
    // 5 - updating the user's status
    // 6 - return the response
*/

export const signIn = async (req, res, next) => {
    // 1 - destructing the required data
    const { email, mobileNumber, password } = req.body;
    // 2 - check if the user is already exist by using email or mobile phone
    const userExist = await User.findOne({
        $or: [
            { email },
            { mobileNumber }
        ]
    })
    if (!userExist) {
        return next(new Error('Invalid login credentials , please signUp', { cause: 404 }));
    }
    // 3 - check the password
    const verifiedPassword = bcrypt.compareSync(password, userExist.password);
    if (!verifiedPassword) {
        return next(new Error('password is incorrect', { cause: 400 }));
    }
    // 4 - create user token
    const userToken = jwt.sign({ email, id: userExist._id }, process.env.JWT_SECRET_LOGIN, { expiresIn: '1h' });
    // 5 - updating the user's status
    userExist.userStatus = 'online';
    await userExist.save();
    // 6 - return the response
    return res.status(200).json({
        success: true,
        message: 'user logged in successfully',
        token: userToken
    });
}

// ============================= verify the email ========================== //

/*
    // 1 - destructing the required data 
    // 2 - verify user's token 
    // 3 - get user by email whith isEmailVerified = false
    // 4 - check if the user exist or not
    // 5 - return the response
*/
export const verifyEmail = async (req, res, next) => {
    // 1 - destructing the required data 
    const { token } = req.query;
    // 2 - verify user's token 
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_VEREFICATION);
    // 3 - get user by email whith isEmailVerified = false
    const findUser = await User.findOneAndUpdate({ email: decodedData.email, isEmailVerified: false }, { isEmailVerified: true }, { new: true });
    // 4 - check if the user exist or not
    if (!findUser) {
        return next(new Error(`user not foud`, { cause: 404 }));
    }
    // 5 - return the response
    return res.status(200).json({
        success: true,
        message: 'email verified successfully',
        data: findUser
    });
}


// ============================= update account =============================== //
/*
    // 1 - destructing the required data
    // 2 - destructing the id of the signedIn user (account owner)
    // 3 - find the user by id
    // 4 - check if the user wants to change his email
        // 4.1 - check if the new email is the same of old one
        // 4.2 - if the two emails are diffrent then we update the value of the old email
    // 5 - check if the user wants to change his mobile number
        // 5.1 - check if the new mobile number is the same of old one
        // 5.2 - if the two mobile numbers are diffrent then we update the value of the old mobile number
    // 6 - check if the user wants to change his img
        // 6.1 - we delete the old img from cloudinary
        // 6.2 - we update the value of the old img
        // 6.3 - update the image object
    // 7 - update the remaining details
    // 8 - save the updated user
    // 9 - return the response
*/
export const updateAccount = async (req, res, next) => {
    // 1 - destructing the required data
    const {
        newFName,
        newLName,
        newEmail,
        newMobileNum,
        newRecoveryEmail,
        newDOB
    } = req.body;
    const {oldPublicId} = req.query;
    // 2 - destructing the id of the signedIn user (account owner)
    const { _id } = req.authUser;
    // 3 - find the user by id
    const user = await User.findById(_id);
    // 4 - check if the user wants to change his email
    if (newEmail) {
        // 4.1 - check if the new email is the same of old one
        if (newEmail === user.email) {
            return next(new Error('new email should be different from old one', { cause: 400 }));
        }
        // 4.2 - if the two emails are diffrent then we update the value of the old email
        user.email = newEmail;
    }
    // 5 - check if the user wants to change his mobile number
    if (newMobileNum) {
        // 5.1 - check if the new mobile number is the same of old one
        if (newMobileNum === user.mobileNumber) {
            return next(new Error('new mobile number should be different from old one', { cause: 400 }));
        }
        // 5.2 - if the two mobile numbers are diffrent then we update the value of the old mobile number
        user.mobileNumber = newMobileNum;
    }

    // 6 - check if the user wants to change his img
    if (oldPublicId) {
        // 6.1 - we delete the old img from cloudinary
        await cloudinaryConnection().uploader.destroy(oldPublicId);
        // 6.2 - we update the value of the old img
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_MEDIA_FOLDER}/USERS/${user.mediaFolderId}/user_picture`
        });
        // 6.3 - store the folder for rollback
        req.folder = `${process.env.MAIN_MEDIA_FOLDER}/USERS/${user.mediaFolderId}/user_picture`;
        // 6.3 - update the image object
        user.userImg = {
            secure_url,
            public_id
        }
    }

    // 7 - update the remaining details
    user.firstName = newFName;
    user.lastName = newLName;
    user.recoveryEmail = newRecoveryEmail;
    user.DOB = newDOB;
    user.userName = newFName + ' ' + newLName;
    // 8 - save the updated user
    await user.save();
    // 9 - return the response
    return res.status(200).json({
        success: true,
        message: 'account updated successfully',
        data: user
    });
}

// =========================== delete account ========================== // 
/*
    // 1 - destructing the user id of the loggedIn user(account owner)
    // 2 - find the user & delete user's document from DB
    // 3 - check if the user's document is deleted or not
    // 4 - delete user's media folder from cloudinary
    // 5 - return the response
*/
export const deleteAccount = async (req, res, next) => {
    // 1 - destructing the user id of the loggedIn user(account owner)
    const { _id } = req.authUser;
    // 2 - find the user & delete user's document from DB
    const deletedUser = await User.findByIdAndDelete(_id);
    // 3 - check if the user's document is deleted or not
    if (!deletedUser) {
        return next(new Error('user not found', { cause: 404 }));
    }
    // 4 - delete user's media folder from cloudinary
    const { mediaFolderId } = deletedUser;
    await cloudinaryConnection().api.delete_resources_by_prefix(`Job_Board/USERS/${mediaFolderId}`);
    await cloudinaryConnection().api.delete_folder(`Job_Board/USERS/${mediaFolderId}`);
    // 5 - return the response
    return res.status(200).json({
        success: true,
        message: 'account deleted successfully'
    });
}

// ========================= Get user account data ================= // 
/*
    // 1 - destructing the user id of the loggedIn user(account owner)
    // 2 - find the user & return the data
    // 3 - return the response
*/
export const getUserAccountData = async (req, res, next) => {
    // 1 - destructing the user id of the loggedIn user(account owner)
    const { _id } = req.authUser;
    // 2 - find the user & return the data
    const user = await User.findById(_id);
    if (!user) {
        return next(new Error('user not found', { cause: 404 }));
    }
    // 3 - return the response
    return res.status(200).json({
        success: true,
        message: 'account data fetched successfully',
        data: user
    });
}

// ========================= Get profile data for any other user ================ //
/*
    // 1 - destructing the user's id
    // 2 - find the user & return the data
    // 3 - check if the user exist
    // 4 - return the response
*/
export const getAnyUsersProfile = async (req, res, next) => {
    // 1 - destructing the user's id
    const { _id } = req.params;
    // 2 - find the user & return the data
    const user = await User.findById(_id);
    // 3 - check if the user exist
    if (!user) {
        return next(new Error('user not found', { cause: 404 }));
    }
    // 4 - return the response
    return res.status(200).json({
        success: true,
        message: 'user profile fetched successfully',
        data: user
    });
}

// ======================== Get all accounts associated to a specific recovery Email ================ // 
/*
    // 1 - destructing the recovery email
    // 2 - find all users with the same recovery email
    // 3 - check if any user found
    // 4 - return the response
*/
export const getAllAccountsByEmail = async (req, res, next) => {
    // 1 - destructing the recovery email
    const { recoveryEmail } = req.body;
    // 2 - find all users with the same recovery email
    const users = await User.find({ recoveryEmail });
    // 3 - check if any user found
    if (!users.length) {
        return next(new Error('No account found associated with this recovery email', { cause: 404 }));
    }
    // 4 - return the response
    return res.status(200).json({
        success: true,
        message: 'accounts fetched successfully',
        data: users
    });
}

// ======================== Update password ========================= //
/*
    // 1 - destructing the user id of the loggedIn user(account owner)
    // 2 - destructing the old password
    // 3 - find the user 
    // 4 - check if the user exist 
    // 5 - check if the old password is correct
    // 6 - update the password
    // 7 - save the updated user
    // 8 - return the response
*/
export const updatePassword = async (req, res, next) => {
    // 1 - destructing the user id of the loggedIn user(account owner)
    const { _id } = req.authUser;
    // 2 - destructing the old password
    const { oldPassword, newPassword } = req.body;
    // 3 - find the user 
    const user = await User.findById(_id);
    // 4 - check if the user exist 
    if (!user) {
        return next(new Error('user not found', { cause: 404 }));
    }
    // 5 - check if the old password is correct
    const validatePassword = bcrypt.compareSync(oldPassword, user.password);
    if (!validatePassword) {
        return next(new Error('incorrect old password', { cause: 401 }));
    }
    // 6 - update the password
    user.password = bcrypt.hashSync(newPassword, +process.env.SALT_ROUNDS);
    // 7 - save the updated user
    await user.save();
    // 8 - return the response
    return res.status(200).json({
        success: true,
        message: 'password updated successfully'
    });
}

// ========================= Forget password ======================= //
/*
    // 1 - destructing the user's email
    // 2 - check if the email is exist
    // 3 - generate a random otp
    // 4 - send email to user containing the otp
    // 5 - save the otp in the user's document
    // 6 - return the response
*/
export const forgetPassword = async (req, res, next) => {
    // 1 - destructing the user's email
    const { email } = req.body;
    // 2 - check if the email is exist
    const isUserExist = await User.findOne({ email });
    if (!isUserExist) {
        return next(new Error('No account found associated with this email', { cause: 404 }));
    }
    // 3 - generate a random otp
    const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    // 4 - send email to user containing the otp
    const isEmailSent = await sendEmailService({
        to: email,
        subject: 'Changing Password',
        message: `<section style="width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
        <div style="width: 50%; background-color: rgba(128, 128, 128,0.3); height: 20vh; border-radius: .625rem; text-align: center;">
            <h2 style=" color: black; text-shadow: 7px 7px 5px  white;display:block;font-size:25px;">Please Use The Following OTP To Reset Your Password</h2>
            <h4 style=" color: blue; text-shadow: 7px 7px 5px  white;display:block;font-size:25px;">${OTP}</h4>
        </div>
    </section>`
    });
    if (!isEmailSent) {
        return next(new Error('Failed to send email', { cause: 500 }));
    }
    // 5 - save the otp in the user's document
    isUserExist.OTP = bcrypt.hashSync(OTP,+process.env.SALT_ROUNDS);
    await isUserExist.save();
    // 6 - return the response
    return res.status(200).json({
        success: true,
        message: 'OTP sent successfully, please check your email'
    });
}

// ========================= Reset password ======================= //
/*
    // 1 - destructing the required data 
    // 2 - finding the user
    // 3 - check if otp is valid
    // 4 - update the password
    // 5 - delete the otp from the user document
    // 6 - return response
*/
export const resetPassword = async (req, res, next) => {
    // 1 - destructing the required data 
    const { email, OTP, newPassword } = req.body;
    // 2 - finding the user
    const requirdUser = await User.findOne({ email });
    if (!requirdUser) {
        return next(new Error('No account found associated with this email', { cause: 404 }));
    }
    // 3 - check if otp is valid
    const validateOTP = bcrypt.compareSync(OTP, requirdUser.OTP);
    if (!validateOTP) {
        return next(new Error('OTP is Incorrect', { cause: 401 }));
    }
    // 4 - update the password
    requirdUser.password = bcrypt.hashSync(newPassword, +process.env.SALT_ROUNDS);
    // 5 - delete the otp from the user document
    requirdUser.OTP = '';
    await requirdUser.save();
    // 6 - return response
    return res.status(200).json({
        success: true,
        message: 'Password reset successfully'
    });
}