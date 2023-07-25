import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
  city: String,
  city_ascii: String,
  lat: Number,
  lng: Number,
  country: String,
  iso2: String,
  iso3: String,
  admin_name: String,
  capital: String,
  population: Number,
  id: Number,
});

const City =
  mongoose.models.City || mongoose.model("City", citySchema, "worldcities");
export default City;
