import { createPatientCurrentDoctor } from "../models/patient.model.js";
import { asyncHandeler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// ##create a Patient. 
const createPatient = asyncHandeler(async (req, res) => {
    // TODO
    // Input -> username, email, fullname;
    const { username, email, fullname } = req.body;

    if([username, email, fullname].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All field are required.");
    }

    // Patient Schma create throw createPatientCurrentDoctor
    const Patient = await createPatientCurrentDoctor(req?.user);

    const existPatient = await Patient.findOne({
        $or: [{username}, {email}],
    });

    if(existPatient){
        throw new ApiError(409, "Patient with email and username already exists");
    }

    const patient = await Patient.create({
        username, 
        email, 
        fullname,
    });

    if(!patient){
        throw new ApiError(500, "Something went wrong while registering the patient");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            patient,
            "Patient Register Successfully"
        )
    );
});

export {
    createPatient,
}