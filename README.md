# mean_map
Map based on MEAN stack


### Steps to run

- Extract the code from zip

- Perform npm install 

- Perform bower install 

- Start server using node server  -the server will start at localhost:3000

- Run Populate Data Centres query from the POSTMAN - This will populate it with the List of data centres given

> Important: You must ensure that centre_code &  location properties are unique. Geo location filtering would not work properly if 2 entries have same location.
> Important: location should be in the format of [ Longitude, Latitude ]

- You can now run the app on localhost:3000