package me.weixler.beans.repos;

import me.weixler.beans.DBPinMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface PinStateRepository extends JpaRepository<DBPinMode, Long> {
    @Query("Select s " +
            "from Schema u " +
            "inner join pinState s on u.id=s.dbSchema " +
            "inner join Pin p on s.dbPin=p.id " +
            "where u.id=:schemaid and p.id=:pinid")
    DBPinMode getState(@Param("schemaid") long schemaid, @Param("pinid") long pinid);
}
