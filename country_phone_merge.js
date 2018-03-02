// move countries collection from countries database to book database where phones collection is, and name it country collection. 
db.countries.find().forEach(function(d){ db.getSiblingDB('book')['country'].insert(d); });

// the following code just combined the two collections into one collection called combined. 
db.phones.copyTo("combined")
db.country.copyTo("combined")
db.combined.find().limit(1)
db.combined.find().count()

// The country field in phone collection and the callingCode field in country collection should be the key to join the two collections together. However, the type of the country field is integer and the type of the callingCode field is an array with string values. We need to make them the same type. First, I convert the country field from integer to string, as the following code does.
db.phones.find({"components.country": {$exists: true}}).forEach(function(obj) {
	obj.components.country = "" + obj.components.country;db.phones.save(obj);
});

db.phones.find().limit(1)


// Now we can merge the two collections into merged collection.
db.phones.aggregate([
{$lookup: {
		from: "country",
		localField: "components.country",
		foreignField: "callingCode",
		as: "country_info"
	}},
{
	$out : "merged"
}])

// This merged collection contains all the records from phones collection and corresponding country information, which shares the same country code, from country collection. 
db.merged.find().limit(7);

// The country information for the first six records are missing, which means there aren't countries whose callingCode is 5,2,6,3 in country collection, but there's Russia whose callingCode is 7. So there's country info for the seventh record whose country code is 7. 

// For the above merged collection, you are able to find the corresponding country information for each phone record. For the following merged_phone collection, you are able to find the corresponding phones information for each country, although only three countries have the information.

db.country.aggregate([ 
	{$unwind:"$callingCode"}, 
	{$lookup: { 
		from: "phones", 
		localField: "callingCode", 
		foreignField: "components.country", 
		as: "country_info" } }, 
	{ $match: { "country_info": { $ne: [] } } }, 
	{ $out : "merged_phone" }])

db.merged_phone.find().count()
db.merged_phone.find().limit(1)

