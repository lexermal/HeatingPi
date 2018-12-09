package me.weixler.beans.repos;

import me.weixler.beans.db2.DBSchema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchemaRepository extends JpaRepository<DBSchema, Long>{

}
