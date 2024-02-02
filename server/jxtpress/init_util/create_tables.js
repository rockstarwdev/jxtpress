 
/**
 * { DocString #File Centralizes code for the site's initial configuration.  Operations
 *  performed includes: database table setup and upgrade configurations, initial population 
 * of default records, and other functions.  This file is intended to be imported and invoked from 
 * server endpoints responsible for site configuration and not to be invoked from core jxtpress classes.
 * }
 */
  
export default async  (db, core) => {//db = instance of Database
 
    let D = db.name;
    let type_len=80
    let schema =
    `CREATE TABLE IF NOT EXISTS ${D}.accounts (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY, 
        parent_id       BIGINT DEFAULT NULL,
        title           VARCHAR(255) DEFAULT NULL,   
        type            VARCHAR(${type_len}) DEFAULT NULL, 
        status          VARCHAR(80) DEFAULT NULL, 

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (type)
    ) ENGINE=INNODB;

    CREATE TABLE IF NOT EXISTS ${D}.options (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY,  
        name           VARCHAR(255) DEFAULT NULL,   
        value          MEDIUMTEXT DEFAULT NULL, 
        INDEX (name)
    ) ENGINE=INNODB;


    CREATE TABLE IF NOT EXISTS ${D}.account_members (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY, 
        account_id      BIGINT DEFAULT NULL,
        user_id         BIGINT DEFAULT NULL,
        status          VARCHAR(80) DEFAULT NULL, 
        end             TIMESTAMP DEFAULT NULL,    

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
    ) ENGINE=INNODB;


    CREATE TABLE IF NOT EXISTS ${D}.likes (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY,  
        object_type     VARCHAR(255) DEFAULT NULL,   
        object_id       BIGINT DEFAULT NULL,   
        created_by      BIGINT DEFAULT NULL,
        value           BIGINT DEFAULT NULL,

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
    ) ENGINE=INNODB;


    CREATE TABLE IF NOT EXISTS ${D}.roles (
            id              BIGINT AUTO_INCREMENT PRIMARY KEY,  
            title           VARCHAR(255) DEFAULT NULL,   
            description     VARCHAR(255) DEFAULT NULL,   
            image           VARCHAR(255) DEFAULT NULL,  

            created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
            modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
    ) ENGINE=INNODB;
 

     

    CREATE TABLE IF NOT EXISTS ${D}.categories (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY,  
        parent_id       BIGINT DEFAULT NULL ,
        title           VARCHAR(255) DEFAULT NULL,   
        description     VARCHAR(255) DEFAULT NULL,   
        slug            VARCHAR(255) DEFAULT NULL,  
        image           VARCHAR(255) DEFAULT NULL,  

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by      BIGINT DEFAULT NULL,
        INDEX ( parent_id, title, created_by) 
    ) ENGINE=INNODB;
               


    CREATE TABLE IF NOT EXISTS ${D}.analytics (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY,  
        user_id         BIGINT DEFAULT NULL,
        post_id         BIGINT DEFAULT NULL,
        ip              VARCHAR(150) DEFAULT NULL,
        duration        INT DEFAULT NULL,
        clicks          INT DEFAULT NULL,
        url_from        VARCHAR(255) DEFAULT NULL, 
        url_to         VARCHAR(255) DEFAULT NULL,
        type            VARCHAR(${type_len}) DEFAULT NULL, 

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
    ) ENGINE=INNODB;


    `;
    try{ 
        await db.query(schema)
        core.log("Created tables [1]")
    }catch(e){
        core.error("Table instation error during accounts & account_option tables");
        return false; 
    }

    // User Tables
    schema =
    `CREATE TABLE IF NOT EXISTS ${D}.users (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY,  
        parent_id       BIGINT DEFAULT NULL,
        name            VARCHAR(100) DEFAULT NULL,   
        title           VARCHAR(255) DEFAULT NULL,
        email           VARCHAR(255) DEFAULT NULL,
        status          VARCHAR(80) DEFAULT NULL, 
        eid             VARCHAR(255) DEFAULT NULL,


        password        VARCHAR(255) DEFAULT NULL,
        salt           VARCHAR(255) DEFAULT NULL,


        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX ( parent_id, name, email, status,eid)
    ) ENGINE=INNODB;

    CREATE TABLE IF NOT EXISTS ${D}.user_metas (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY, 
        user_id         BIGINT DEFAULT NULL,
        name           VARCHAR(255) DEFAULT NULL,   
        value          MEDIUMTEXT DEFAULT NULL, 

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (user_id, name)
    ) ENGINE=INNODB;

    CREATE TABLE IF NOT EXISTS ${D}.user_roles (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY,  
        user_id         BIGINT DEFAULT NULL,
        role_id         BIGINT DEFAULT NULL,
        status           VARCHAR(80) DEFAULT NULL,    

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX ( user_id, role_id, status)
    ) ENGINE=INNODB;

    CREATE TABLE IF NOT EXISTS ${D}.tags (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY,  
        title           VARCHAR(255) DEFAULT NULL,
        description     VARCHAR(255) DEFAULT NULL,   

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (  title )
    ) ENGINE=INNODB;


    `;
    try{ 
        await db.query(schema)
        core.log("Created tables [2]")
    }catch(e){
        core.error("Table instation error during users & user_meta tables");
        return false; 
    }



    // Groups Tables
    schema =
    `CREATE TABLE IF NOT EXISTS ${D}.groups (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY,  
        created_by      BIGINT DEFAULT NULL,   
        title           VARCHAR(255) DEFAULT NULL,
        description     VARCHAR(255) DEFAULT NULL,
        image           VARCHAR(255) DEFAULT NULL, 

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (  created_by)
    ) ENGINE=INNODB;
 

    CREATE TABLE IF NOT EXISTS ${D}.group_members (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY, 
        group_id        BIGINT DEFAULT NULL,
        user_id         BIGINT DEFAULT NULL,
        status          VARCHAR(80) DEFAULT NULL, 
        type            VARCHAR(${type_len}) DEFAULT NULL,    
        end             TIMESTAMP DEFAULT NULL,   

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (group_id, user_id, status,  type)
    ) ENGINE=INNODB;



    CREATE TABLE IF NOT EXISTS ${D}.posts (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY,  
        group_id        BIGINT DEFAULT NULL,
        created_by      BIGINT DEFAULT NULL,
        parent_id       BIGINT DEFAULT NULL,
        category_id     BIGINT DEFAULT NULL,
        type            VARCHAR(${type_len}) DEFAULT NULL, 
        status          VARCHAR(80) DEFAULT NULL,    
        start           TIMESTAMP DEFAULT NULL,   
        end             TIMESTAMP DEFAULT NULL,   
        title           VARCHAR(255) DEFAULT NULL, 
        description     VARCHAR(255) DEFAULT NULL,
        value           MEDIUMTEXT DEFAULT NULL, 
        amount          decimal(15,2) DEFAULT 0.00,
        url             VARCHAR(255) DEFAULT NULL, 
        linked_to       BIGINT DEFAULT NULL,
        source_id       BIGINT DEFAULT NULL,
        eid             VARCHAR(255) DEFAULT NULL, 
        linked_eid      VARCHAR(255) DEFAULT NULL, 

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        published       TIMESTAMP DEFAULT NULL, 
        aux             VARCHAR(255) DEFAULT NULL, 

        INDEX ( group_id, created_by,parent_id,category_id, type,status, url,eid)
    ) ENGINE=INNODB;


    CREATE TABLE IF NOT EXISTS ${D}.post_access (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY, 
        post_id         BIGINT DEFAULT NULL,
        read_group      BIGINT DEFAULT NULL,
        update_group      BIGINT DEFAULT NULL,
        delete_group      BIGINT DEFAULT NULL,  

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (post_id, read_group, update_group,delete_group)
    ) ENGINE=INNODB;



    CREATE TABLE IF NOT EXISTS ${D}.post_linkages (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY, 
        post_id         BIGINT DEFAULT NULL,
        related_id      BIGINT DEFAULT NULL,

        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (post_id, related_id)
    ) ENGINE=INNODB;


    CREATE TABLE IF NOT EXISTS ${D}.post_metas (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY, 
        post_id         BIGINT DEFAULT NULL,
        name            VARCHAR(255) DEFAULT NULL,
        value          MEDIUMTEXT DEFAULT NULL,  
        
        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (post_id, name)
    ) ENGINE=INNODB;



    CREATE TABLE IF NOT EXISTS ${D}.post_tags (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY,
        tag_id          BIGINT DEFAULT NULL,  
        post_id         BIGINT DEFAULT NULL, 
       INDEX (post_id, tag_id)
    ) ENGINE=INNODB;


    CREATE TABLE IF NOT EXISTS ${D}.post_notes (
        id              BIGINT AUTO_INCREMENT PRIMARY KEY, 
        post_id         BIGINT DEFAULT NULL, 
        parent_id       BIGINT DEFAULT NULL, 
        title           VARCHAR(255), 
        value          MEDIUMTEXT DEFAULT NULL,  
        encounter       TIMESTAMP DEFAULT NULL, 
        status          VARCHAR(80) DEFAULT NULL,    
        
        created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        modified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        created_by       BIGINT DEFAULT NULL, 
        INDEX (post_id, parent_id, title,status, created_by)
    ) ENGINE=INNODB; `;
    try{ 
        await db.query(schema)
        core.log("Created tables [3]")
    }catch(e){
        core.error("Table instation error during data");
        return false; 
    }

}



    
