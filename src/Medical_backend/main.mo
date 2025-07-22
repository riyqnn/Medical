import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Int "mo:base/Int";
import Text "mo:base/Text";

actor MedicalCanister {

  type Hospital = {
    id: Nat;
    name: Text;
    logoURL: Text;
    walletAddress: Principal;
    isActive: Bool;
  };

  type Doctor = {
    id: Nat;
    hospitalId: Nat;
    name: Text;
    specialty: Text;
    walletAddress: Principal;
    photoURL: Text;
    isActive: Bool;
  };

  type MedicalRecord = {
    id: Nat;
    patientId: Nat;
    doctorId: Nat;
    hospitalId: Nat;
    diagnosis: Text;
    cpptURL: Text;
    evidenceURLs: [Text];
    createdAt: Int;
  };

  stable var hospitals: [Hospital] = [];
  stable var doctors: [Doctor] = [];
  stable var medicalRecords: [MedicalRecord] = [];

  stable var hospitalCounter: Nat = 0;
  stable var doctorCounter: Nat = 0;
  stable var recordCounter: Nat = 0;

  public shared({caller}) func registerHospital(name: Text, logoURL: Text) : async Text {
    hospitalCounter += 1;
    let newHospital : Hospital = {
      id = hospitalCounter;
      name = name;
      logoURL = logoURL;
      walletAddress = caller;
      isActive = true;
    };
    hospitals := Array.append(hospitals, [newHospital]);
    return "Hospital registered with ID: " # Nat.toText(newHospital.id);
  };

  public shared({caller}) func deactivateHospital(hospitalId: Nat) : async Text {
    hospitals := Array.map<Hospital, Hospital>(hospitals, func (h) : Hospital {
      if (h.id == hospitalId and h.walletAddress == caller) {
        { h with isActive = false }
      } else { h }
    });
    return "Hospital deactivated";
  };

  public shared({caller}) func registerDoctor(hospitalId: Nat, name: Text, specialty: Text, photoURL: Text, doctorWallet: Principal) : async Text {
    let isAuthorized = Array.find<Hospital>(hospitals, func (h) : Bool { h.id == hospitalId and h.walletAddress == caller });
    if (isAuthorized == null) {
      return "Unauthorized: Only hospital owner can register doctor";
    };
    doctorCounter += 1;
    let newDoctor : Doctor = {
      id = doctorCounter;
      hospitalId = hospitalId;
      name = name;
      specialty = specialty;
      walletAddress = doctorWallet;
      photoURL = photoURL;
      isActive = true;
    };
    doctors := Array.append(doctors, [newDoctor]);
    return "Doctor registered with ID: " # Nat.toText(newDoctor.id);
  };

  public shared({caller}) func deactivateDoctor(doctorId: Nat) : async Text {
    let doctorOpt = Array.find<Doctor>(doctors, func (d) : Bool { d.id == doctorId });
    switch (doctorOpt) {
      case null return "Doctor not found";
      case (?doctor) {
        let isAuthorized = Array.find<Hospital>(hospitals, func (h) : Bool { h.id == doctor.hospitalId and h.walletAddress == caller });
        if (isAuthorized == null) {
          return "Unauthorized: Only hospital owner can deactivate doctor";
        };
        doctors := Array.map<Doctor, Doctor>(doctors, func (d) : Doctor {
          if (d.id == doctorId) { { d with isActive = false } } else { d }
        });
        return "Doctor deactivated";
      }
    }
  };

  public shared({caller}) func addMedicalRecord(patientId: Nat, hospitalId: Nat, diagnosis: Text, cpptURL: Text, evidenceURLs: [Text]) : async Text {
    let doctorOpt = Array.find<Doctor>(doctors, func (d) : Bool { d.walletAddress == caller and d.hospitalId == hospitalId and d.isActive });
    switch (doctorOpt) {
      case null return "Unauthorized: You are not an active doctor in this hospital";
      case (?doctor) {
        recordCounter += 1;
        let newRecord : MedicalRecord = {
          id = recordCounter;
          patientId = patientId;
          doctorId = doctor.id;
          hospitalId = hospitalId;
          diagnosis = diagnosis;
          cpptURL = cpptURL;
          evidenceURLs = evidenceURLs;
          createdAt = Time.now() : Int;
        };
        medicalRecords := Array.append(medicalRecords, [newRecord]);
        return "Medical record added with ID: " # Nat.toText(newRecord.id);
      }
    }
  };

  public query func getHospitals() : async [Hospital] {
    hospitals;
  };

  public query func getDoctors() : async [Doctor] {
    doctors;
  };

  public query func getMedicalRecordsByPatient(patientId: Nat) : async [MedicalRecord] {
    Array.filter<MedicalRecord>(medicalRecords, func (r) : Bool { r.patientId == patientId });
  };

};