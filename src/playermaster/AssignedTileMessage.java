package playermaster;

public class AssignedTileMessage {
    final int antId; // 1 < id < 10000 so it takes 14 bits
    final int round;

    /**Bits position in bitmap:
     *
     * - Bits 0-15: Ant ID
     * - Bits 16-31: Round
     */
    private final int idMask = 0x0000FFFF; //at most 15
    private final int roundMask = 0xFFFF0000; //at most 255
    private final int roundShift = 16;

    public AssignedTileMessage(int _antId, int _round) {
        this.antId = _antId;
        this.round = _round;
    }

    public AssignedTileMessage(int bitmap) {
        this.round = (bitmap & roundMask) >> roundShift;
        this.antId = bitmap & idMask;
    }

    public int Encode() {
        return ((round & 0xFFFF) << roundShift) |(antId & 0xFFFF);
    }

    public int GetAntId() {
        return antId;
    }

    public int GetRound() {
        return round;
    }

}
