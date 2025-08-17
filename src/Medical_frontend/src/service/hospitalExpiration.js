
// Utility function to check if hospital is expired (frontend calculation)
// This to make sure that we use cycle if it really needed
export const isHospitalExpired = (hospital) => {
  if (!hospital.expiredAt || hospital.expiredAt.length === 0) {
    return false;
  }
  
  const nowInSec = Math.floor(Date.now() / 1000);
  const expiredAt = Number(hospital.expiredAt[0]); // Handle Optional type from Motoko
  console.log("Is Hospital Expired?",expiredAt < nowInSec)
  console.log("Is Hospital Active?",hospital.isActive)
  return expiredAt < nowInSec;
};

export const singleHospitalExpirationCheck = async (hospital, actor) => {
  // First, quick frontend check
  const frontendExpired = isHospitalExpired(hospital);
  console.log("Ini actor di service",actor)
  console.log("Actorr : " ,Object.keys(actor));
  if (!frontendExpired) {
    return false; // Not expired, no need for backend call
  }
  
  // Only call backend if frontend thinks it's expired AND hospital is still active
  if (hospital.isActive) {
    try {
      console.log("Jalan Guyss")
      return await actor.deactivateHospitalIfExpired(Number(hospital.id));
    } catch (error) {
      console.error('Backend expiration check failed:', error);
      return frontendExpired; // Fall back to frontend calculation
    }
  }
  
  return true; // Expired and already inactive
};