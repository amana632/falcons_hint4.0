
echo "Y" | ssh-keygen -t rsa -P '' -f config/id_rsa

if [ ! -d "depends" ]; then
  echo "Hadoop And Spark Dependecies not found...."
  echo "Hang for few mins !! Downloading in progress..."
  mkdir -p depends
  wget https://archive.apache.org/dist/hadoop/core/hadoop-3.2.0/hadoop-3.2.0.tar.gz -P ./depends
  echo "Hadoop Downloaded !!"
  wget https://archive.apache.org/dist/spark/spark-2.4.0/spark-2.4.0-bin-without-hadoop.tgz -P ./depends
  echo "Spark Downloaded !!"
else
  echo "Voila !! Depencies Found...! Skipping Retreival !"
fi

docker build . -t sparkbase
