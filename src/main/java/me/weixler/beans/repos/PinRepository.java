package me.weixler.beans.repos;

import me.weixler.beans.db2.DBPin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PinRepository extends JpaRepository<DBPin, Long> {
    @Query("Select p " +
            "from Schema u " +
            "inner join State s on u.id=s.schema " +
            "inner join Pin p on s.pin=p.id " +
            "where u.id=:schemaid")
    public List<DBPin> getAllBy(@Param("schemaid") long schemaid);
}
