#Singapore Haze Watch Server

The National Environment Agency (NEA) in Singapore provides a data feed (https://www.nea.gov.sg/api) of a number of important data points. Amongst them is the Pollutions Standards Index (PSI) readings throughout the day. The data is updated regularly (on a hourly basis) and is provided as XML.

While the data is great, there are a few minor irritants. 

1. The data is only available in XML. It's a lot more convenient to have it in JSON
2. The API can be pretty slow at times
3. It can be a drag to even try to parse the information from JSON, it would be a great convenience to have it in plain text upon query

The Singapore Haze Watch Server is built to provide these conveniences.

It is also built to support the Singapore Haze Watch Pebble app (and other similar apps) - https://apps.getpebble.com/applications/55fbe95c5150be7a9a00005c

Source code for Pebble app is at https://github.com/sausheong/sghaze.

Both the Pebble app and the SG Haze Watch Server are licensed under the MIT license. 