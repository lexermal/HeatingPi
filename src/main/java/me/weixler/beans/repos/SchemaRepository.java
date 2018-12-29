package me.weixler.beans.repos;

import me.weixler.beans.db2.DBSchema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchemaRepository extends JpaRepository<DBSchema, Long> {
    @Query("Select u " +
            "from Schema u " +
            "where u.active=true")
    List<DBSchema> getAllActive();
}
