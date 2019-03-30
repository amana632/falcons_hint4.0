# Hadoop Spark Cluster

This is a hadoop-spark cluster setup which enables one to one client master setup. This will let you make a master and 
3 slaves nodes running in a dockerized container on client system.

## How To Setup Your own Setup :
1) Clone this repository or alternatively run
    ```bash 
    $ git clone https://github.com/amana632/falcons_hint4.0.git
    $ cd hadoop-cluster/scalabase
    $ ./build.sh        # This will build the base java+scala debian container from openjdk9
    $ cd ../spark
    $ ./build.sh         # This builds sparkbase image
6) Now run 
    ```bash
    $ ./cluster.sh deploy
7) The script will finish displaying the Hadoop and Spark admin URLs:
    * Hadoop info @ nodemaster: http://172.18.1.1:8088/cluster
    * Spark info @ nodemaster : http://172.18.1.1:8080/
    * DFS Health @ nodemaster : http://172.18.1.1:9870/dfshealth.html

## Extras:
```bash
$ cluster.sh stop   # Stop the cluster
$ cluster.sh start  # Start the cluster
$ cluster.sh info   # Shows handy URLs of running cluster
